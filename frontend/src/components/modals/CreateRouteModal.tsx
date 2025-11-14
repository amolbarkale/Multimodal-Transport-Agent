import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { RouteCreate, Path, Stop, RouteStatus } from "@/types";

interface CreateRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RouteCreate) => void;
  availablePaths?: Path[];
  availableStops?: Stop[]; // Now accepts stops as a prop
}

export function CreateRouteModal({ open, onOpenChange, onSubmit, availablePaths = [], availableStops = [] }: CreateRouteModalProps) {
  const [formData, setFormData] = useState<RouteCreate>({
    path_id: 0,
    route_display_name: "",
    shift_time: "",
    direction: "LOGIN",
    start_point: "", // This will be derived
    end_point: "",   // This will be derived
    capacity: 40,
    allocated_waitlist: 0,
    status: RouteStatus.ACTIVE
  });

  // Effect to derive start/end points when path_id changes
  useEffect(() => {
    if (formData.path_id > 0 && availablePaths.length > 0 && availableStops.length > 0) {
      const selectedPath = availablePaths.find(p => p.path_id === formData.path_id);
      if (selectedPath) {
        const stopIds = selectedPath.ordered_stop_ids.split(',').map(Number);
        const firstStop = availableStops.find(s => s.stop_id === stopIds[0]);
        const lastStop = availableStops.find(s => s.stop_id === stopIds[stopIds.length - 1]);
        
        setFormData(prev => ({
          ...prev,
          start_point: firstStop?.name || "Unknown",
          end_point: lastStop?.name || "Unknown",
        }));
      }
    }
  }, [formData.path_id, availablePaths, availableStops]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.path_id === 0) {
      alert("Please select a path.");
      return;
    }
    // Create a copy of the data to send, excluding derived fields
    const { start_point, end_point, ...dataToSend } = formData;
    onSubmit(dataToSend as RouteCreate);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Create New Route</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="route_display_name">Route Name</Label>
            <Input id="route_display_name" value={formData.route_display_name} onChange={(e) => setFormData({ ...formData, route_display_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Select value={formData.path_id.toString()} onValueChange={(value) => setFormData({ ...formData, path_id: parseInt(value) })}>
                <SelectTrigger><SelectValue placeholder="Select path" /></SelectTrigger>
                <SelectContent>
                  {availablePaths.map(path => (<SelectItem key={path.path_id} value={path.path_id.toString()}>{path.path_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift_time">Shift Time</Label>
              <Input id="shift_time" type="time" value={formData.shift_time} onChange={(e) => setFormData({ ...formData, shift_time: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Start Point</Label><Input value={formData.start_point} disabled className="bg-muted" /></div>
            <div className="space-y-2"><Label>End Point</Label><Input value={formData.end_point} disabled className="bg-muted" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Route</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}