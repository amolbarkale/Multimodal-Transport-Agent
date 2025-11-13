import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { RouteMap } from "@/components/map/RouteMap";
import { useQuery } from "@tanstack/react-query";
import { getTrips, getTripRouteStops } from "@/services/api";
import { DailyTrip, Stop } from "@/types";

export default function BusDashboard() {
  const [selectedTrip, setSelectedTrip] = useState<DailyTrip | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- DATA FETCHING using React Query ---
  const { data: trips, isLoading: isLoadingTrips } = useQuery<DailyTrip[]>({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  useEffect(() => {
    if (!selectedTrip && trips && trips.length > 0) {
      setSelectedTrip(trips[0]);
    }
  }, [trips, selectedTrip]);

  const { data: selectedTripStops, isLoading: isLoadingMap } = useQuery<Stop[]>({
    queryKey: ["tripStops", selectedTrip?.trip_id],
    queryFn: () => {
      // --- THIS IS THE CRITICAL FIX ---
      // Add a guard clause to prevent the API call if there's no selected trip.
      if (!selectedTrip) {
        return Promise.resolve([]); // Return empty data, don't call the API
      }
      return getTripRouteStops(selectedTrip.trip_id);
    },
    enabled: !!selectedTrip,
  });

  // --- UI LOGIC ---
  const filteredTrips =
    trips?.filter((trip) =>
      trip.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusColor = (status: string) => {
    // ... (this function is correct, no changes needed)
    switch (status) {
        case "scheduled": return "bg-blue-500/10 text-blue-600";
        case "in_progress": return "bg-yellow-500/10 text-yellow-600";
        case "completed": return "bg-green-500/10 text-green-600";
        case "cancelled": return "bg-red-500/10 text-red-600";
        default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bus Dashboard</h1>
            <p className="text-muted-foreground">Manage daily trip operations and vehicle assignments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString()}
          </Button>
          <Input
            placeholder="Search trips by name..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-lg mb-4">Today's Trips</h3>
          <div className="space-y-2 max-h-[750px] overflow-y-auto scrollbar-hide">
            {isLoadingTrips ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No trips available</div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.trip_id} // CORRECTED: Use trip_id
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
                    selectedTrip?.trip_id === trip.trip_id ? "border-primary bg-primary/5" : "border-border" // CORRECTED: Use trip_id
                  }`}
                >
                  <h4 className="font-semibold text-foreground">{trip.display_name}</h4>
                  <p className="text-sm text-primary">{trip.booking_status_percentage.toFixed(0)}% booked</p>
                  <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.live_status)}`}>
                    {trip.live_status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          {!selectedTrip ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {isLoadingTrips ? <Loader2 className="w-8 h-8 animate-spin" /> : <p>Select a trip to view details</p>}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">{selectedTrip.display_name}</h2>
              {/* ... details section ... */}
              <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{selectedTrip.booking_status_percentage.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Booked</div>
                </div>
                <div>
                  <div className={`text-lg font-bold capitalize ${getStatusColor(selectedTrip.live_status).replace('bg-', 'text-')}`}>
                    {selectedTrip.live_status.replace("_", " ")}
                  </div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedTrip.route_id}</div>
                  <div className="text-xs text-muted-foreground">Route ID</div>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-4">Route Map</h3>
              <div className="mb-4">
                {isLoadingMap ? (
                  <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                ) : selectedTripStops && selectedTripStops.length > 0 ? (
                  <RouteMap stops={selectedTripStops} className="h-96" />
                ) : (
                  <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">No route data to display.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}