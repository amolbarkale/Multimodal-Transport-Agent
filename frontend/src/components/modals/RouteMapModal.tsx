import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteMap } from "@/components/map/RouteMap";
import { Loader2 } from "lucide-react";
import type { Route, Stop, Path } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

interface RouteMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: Route | null;
}

export function RouteMapModal({ open, onOpenChange, route }: RouteMapModalProps) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && route) {
      fetchRouteStops(route.path_id);
    }
  }, [open, route]);

  const fetchRouteStops = async (pathId: number) => {
    setLoading(true);
    try {
      // Fetch path with stops
      const pathResponse = await fetch(`${API_URL}/paths/${pathId}`);
      if (pathResponse.ok) {
        const pathData: Path = await pathResponse.json();
        
        // Fetch all stop details
        const stopPromises = pathData.stops
          .sort((a, b) => a.stop_order - b.stop_order)
          .map((pathStop) => 
            fetch(`${API_URL}/stops/${pathStop.stop_id}`).then(res => res.json())
          );
        
        const stopsData = await Promise.all(stopPromises);
        setStops(stopsData);
      }
    } catch (error) {
      console.error("Error fetching route stops:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Route Map - {route?.route_display_name}</DialogTitle>
          <DialogDescription>
            {route?.direction} | {route?.shift_time} | {route?.start_point} → {route?.end_point}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                <p className="text-muted-foreground">Loading route map...</p>
              </div>
            </div>
          ) : stops.length > 0 ? (
            <RouteMap
              stops={stops}
              routeName={route?.route_display_name}
              className="h-[500px]"
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <p className="text-muted-foreground">No stops found for this route</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Stops</p>
              <p className="font-semibold">{stops.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Capacity</p>
              <p className="font-semibold">{route?.capacity} | Waitlist: {route?.allocated_waitlist}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
