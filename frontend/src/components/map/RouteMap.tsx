import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Stop } from "@/types";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteMapProps {
  stops: Stop[];
  routeName?: string;
  className?: string;
}

// Function to fetch route from OSRM
async function fetchOSRMRoute(stops: Stop[]): Promise<[number, number][]> {
  if (stops.length < 2) return [];

  try {
    // Build coordinates string: "lon,lat;lon,lat;lon,lat"
    const coordinates = stops
      .map((stop) => `${stop.longitude},${stop.latitude}`)
      .join(";");

    // Call OSRM API (public demo server)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      console.error("OSRM API error:", response.status);
      return stops.map((stop) => [stop.latitude, stop.longitude]);
    }

    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes[0]) {
      // Extract the route geometry (array of [lon, lat])
      const geometry = data.routes[0].geometry.coordinates;
      // Convert from [lon, lat] to [lat, lon] for Leaflet
      return geometry.map((coord: number[]) => [coord[1], coord[0]]);
    }

    // Fallback to straight lines if routing fails
    return stops.map((stop) => [stop.latitude, stop.longitude]);
  } catch (error) {
    console.error("Error fetching OSRM route:", error);
    // Fallback to straight lines
    return stops.map((stop) => [stop.latitude, stop.longitude]);
  }
}

// Component to auto-fit map bounds to markers
function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(
        stops.map((stop) => [stop.latitude, stop.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, map]);

  return null;
}

export function RouteMap({ stops, routeName, className = "" }: RouteMapProps) {
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default: Bangalore
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (stops.length > 0) {
      // Set center to first stop
      setCenter([stops[0].latitude, stops[0].longitude]);
      
      // Fetch road route from OSRM
      setLoadingRoute(true);
      fetchOSRMRoute(stops).then((coords) => {
        setRouteCoordinates(coords);
        setLoadingRoute(false);
      });
    }
  }, [stops]);

  if (stops.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <p className="text-muted-foreground">No stops available to display route</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline - showing actual road path from OSRM */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#3b82f6"
            weight={5}
            opacity={0.8}
          />
        )}

        {/* Loading indicator */}
        {loadingRoute && routeCoordinates.length === 0 && (
          <div className="absolute top-4 right-4 z-10 bg-white px-3 py-2 rounded shadow-lg text-sm">
            Loading road route...
          </div>
        )}

        {/* Markers for each stop */}
        {stops.map((stop, index) => {
          const isStart = index === 0;
          const isEnd = index === stops.length - 1;
          let icon = stopIcon;

          if (isStart) icon = startIcon;
          else if (isEnd) icon = endIcon;

          return (
            <Marker
              key={stop.stop_id}
              position={[stop.latitude, stop.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">
                    {isStart && "🚦 Start: "}
                    {isEnd && "🏁 End: "}
                    {!isStart && !isEnd && `Stop ${index}: `}
                    {stop.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lat: {stop.latitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lng: {stop.longitude.toFixed(6)}
                  </p>
                  {routeName && (
                    <p className="text-xs text-primary font-semibold mt-1">
                      Route: {routeName}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Auto-fit bounds */}
        <FitBounds stops={stops} />
      </MapContainer>
    </div>
  );
}
