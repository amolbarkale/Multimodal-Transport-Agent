import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { RouteCreate, Path, Stop, RouteStatus } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

interface CreateRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RouteCreate) => void;
  editData?: any;
  availablePaths?: Path[]; // Pass available paths from parent
}

export function CreateRouteModal({ open, onOpenChange, onSubmit, editData, availablePaths = [] }: CreateRouteModalProps) {
  const [formData, setFormData] = useState<RouteCreate>({
    path_id: 0,
    route_display_name: "",
    shift_time: "",
    direction: "LOGIN",
    start_point: "",
    end_point: "",
    capacity: 0,
    allocated_waitlist: 0,
    status: RouteStatus.ACTIVE
  });
  const [stops, setStops] = useState<Stop[]>([]);

  // Fetch stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await fetch(`${API_URL}/stops/all`);
        if (response.ok) {
          const data = await response.json();
          setStops(data);
        }
      } catch (error) {
        console.error("Error fetching stops:", error);
      }
    };
    
    if (open) {
      fetchStops();
    }
  }, [open]);

  // Auto-fill start and end points when path is selected
  useEffect(() => {
    if (formData.path_id > 0 && availablePaths.length > 0 && stops.length > 0) {
      const selectedPath = availablePaths.find(p => p.path_id === formData.path_id);
      if (selectedPath && selectedPath.stops && selectedPath.stops.length >= 2) {
        // Get first and last stop IDs from the path
        const firstStopId = selectedPath.stops[0].stop_id;
        const lastStopId = selectedPath.stops[selectedPath.stops.length - 1].stop_id;
        
        // Find the actual stop names
        const firstStop = stops.find(s => s.stop_id === firstStopId);
        const lastStop = stops.find(s => s.stop_id === lastStopId);
        
        setFormData(prev => ({
          ...prev,
          start_point: firstStop?.name || `Stop ${firstStopId}`,
          end_point: lastStop?.name || `Stop ${lastStopId}`
        }));
      }
    }
  }, [formData.path_id, availablePaths, stops]);

  useEffect(() => {
    if (editData) {
      setFormData({
        path_id: editData.path_id || 0,
        route_display_name: editData.route_display_name || "",
        shift_time: editData.shift_time || "",
        direction: editData.direction || "LOGIN",
        start_point: editData.start_point || "",
        end_point: editData.end_point || "",
        capacity: editData.capacity || 0,
        allocated_waitlist: editData.allocated_waitlist || 0,
        status: editData.status || RouteStatus.ACTIVE
      });
    } else {
      setFormData({
        path_id: 0,
        route_display_name: "",
        shift_time: "",
        direction: "LOGIN",
        start_point: "",
        end_point: "",
        capacity: 0,
        allocated_waitlist: 0,
        status: RouteStatus.ACTIVE
      });
    }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.path_id === 0) {
      alert("Please select a path");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Route" : "Create New Route"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route_display_name">Route Name</Label>
            <Input
              id="route_display_name"
              value={formData.route_display_name}
              onChange={(e) => setFormData({ ...formData, route_display_name: e.target.value })}
              placeholder="e.g., Path1 - 20:00"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Select 
                value={formData.path_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, path_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select path" />
                </SelectTrigger>
                <SelectContent>
                  {availablePaths.map(path => (
                    <SelectItem key={path.path_id} value={path.path_id.toString()}>
                      {path.path_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift_time">Shift Time</Label>
              <Input
                id="shift_time"
                type="time"
                value={formData.shift_time}
                onChange={(e) => setFormData({ ...formData, shift_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={formData.direction} onValueChange={(value) => setFormData({ ...formData, direction: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOGIN">LOGIN</SelectItem>
                <SelectItem value="LOGOUT">LOGOUT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_point">Start Point</Label>
              <Input
                id="start_point"
                value={formData.start_point}
                placeholder="Auto-filled from path"
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_point">End Point</Label>
              <Input
                id="end_point"
                value={formData.end_point}
                placeholder="Auto-filled from path"
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocated_waitlist">Allocated Waitlist</Label>
              <Input
                id="allocated_waitlist"
                type="number"
                min="0"
                value={formData.allocated_waitlist}
                onChange={(e) => setFormData({ ...formData, allocated_waitlist: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editData ? "Update" : "Create"} Route</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
