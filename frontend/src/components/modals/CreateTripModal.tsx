import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DailyTripCreate, Route, Vehicle } from "@/types";

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DailyTripCreate) => void;
  availableRoutes?: Route[];
  availableVehicles?: Vehicle[];
}

export function CreateTripModal({
  open,
  onOpenChange,
  onSubmit,
  availableRoutes = [],
  availableVehicles = [],
}: CreateTripModalProps) {
  const [formData, setFormData] = useState<DailyTripCreate>({
    route_id: 0,
    display_name: "",
    booking_status_percentage: 0,
    live_status: "scheduled",
  });

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (selectedRoute) {
      // Auto-generate display name based on route
      const displayName = `${selectedRoute.route_display_name} - ${selectedRoute.shift_time}`;
      setFormData(prev => ({
        ...prev,
        display_name: displayName,
      }));
    }
  }, [selectedRoute]);

  const handleRouteChange = (routeId: string) => {
    const route = availableRoutes.find(r => r.route_id === parseInt(routeId));
    setSelectedRoute(route || null);
    setFormData(prev => ({
      ...prev,
      route_id: parseInt(routeId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.route_id === 0) {
      alert("Please select a route");
      return;
    }
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      route_id: 0,
      display_name: "",
      booking_status_percentage: 0,
      live_status: "scheduled",
    });
    setSelectedRoute(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
          <DialogDescription>
            Create a new daily trip by selecting a route and vehicle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Route Selection */}
            <div className="grid gap-2">
              <Label htmlFor="route">Route *</Label>
              <Select
                value={formData.route_id.toString()}
                onValueChange={handleRouteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoutes.map((route) => (
                    <SelectItem
                      key={route.route_id}
                      value={route.route_id.toString()}
                    >
                      {route.route_display_name} ({route.direction} - {route.shift_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Display Name */}
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="e.g., Morning Shift - 08:00"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on the dashboard
              </p>
            </div>

            {/* Available Buses Info */}
            <div className="grid gap-2">
              <Label>Available Buses</Label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total buses available:
                  </span>
                  <span className="font-semibold">{availableVehicles.length}</span>
                </div>
                {availableVehicles.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {availableVehicles.slice(0, 3).map((v) => v.license_plate).join(", ")}
                    {availableVehicles.length > 3 && ` and ${availableVehicles.length - 3} more...`}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Vehicles will be assigned after trip creation
              </p>
            </div>

            {/* Route Details */}
            {selectedRoute && (
              <div className="grid gap-2">
                <Label>Route Details</Label>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Direction:</span>
                    <span className="font-medium">{selectedRoute.direction}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{selectedRoute.start_point}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End:</span>
                    <span className="font-medium">{selectedRoute.end_point}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shift Time:</span>
                    <span className="font-medium">{selectedRoute.shift_time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${selectedRoute.status === 'active' ? 'text-success' : 'text-destructive'}`}>
                      {selectedRoute.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Status */}
            <div className="grid gap-2">
              <Label htmlFor="live_status">Initial Status</Label>
              <Select
                value={formData.live_status}
                onValueChange={(value) =>
                  setFormData({ ...formData, live_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Trip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
