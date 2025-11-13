import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { PathCreate, PathStop, Stop } from "@/types";

interface CreatePathModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PathCreate) => void;
  editData?: any;
  availableStops?: Stop[]; // Pass available stops from parent
}

export function CreatePathModal({ open, onOpenChange, onSubmit, editData, availableStops = [] }: CreatePathModalProps) {
  const [formData, setFormData] = useState<PathCreate>({
    path_name: "",
    stops: [
      { stop_id: 0, stop_order: 1 },
      { stop_id: 0, stop_order: 2 }
    ]
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        path_name: editData.path_name || "",
        stops: editData.stops || [
          { stop_id: 0, stop_order: 1 },
          { stop_id: 0, stop_order: 2 }
        ]
      });
    } else {
      setFormData({
        path_name: "",
        stops: [
          { stop_id: 0, stop_order: 1 },
          { stop_id: 0, stop_order: 2 }
        ]
      });
    }
  }, [editData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out any stops with stop_id = 0
    const validStops = formData.stops.filter(s => s.stop_id > 0);
    if (validStops.length < 2) {
      alert("Please select at least 2 stops");
      return;
    }
    onSubmit({ ...formData, stops: validStops });
    onOpenChange(false);
  };

  const addStop = () => {
    const newStopOrder = formData.stops.length + 1;
    setFormData({ 
      ...formData, 
      stops: [...formData.stops, { stop_id: 0, stop_order: newStopOrder }] 
    });
  };

  const removeStop = (index: number) => {
    if (formData.stops.length > 2) {
      const newStops = formData.stops.filter((_, i) => i !== index)
        .map((stop, idx) => ({ ...stop, stop_order: idx + 1 }));
      setFormData({ ...formData, stops: newStops });
    }
  };

  const updateStopId = (index: number, stopId: number) => {
    const newStops = [...formData.stops];
    newStops[index] = { ...newStops[index], stop_id: stopId };
    setFormData({ ...formData, stops: newStops });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Path" : "Create New Path"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path_name">Path Name</Label>
            <Input
              id="path_name"
              value={formData.path_name}
              onChange={(e) => setFormData({ ...formData, path_name: e.target.value })}
              placeholder="e.g., Path1"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>Stops (in order)</Label>
            {formData.stops.map((pathStop, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">{pathStop.stop_order}.</span>
                <select
                  value={pathStop.stop_id}
                  onChange={(e) => updateStopId(index, parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value={0}>Select stop</option>
                  {availableStops.map((stop) => (
                    <option key={stop.stop_id} value={stop.stop_id}>
                      {stop.name}
                    </option>
                  ))}
                </select>
                {formData.stops.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStop(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStop}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stop
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editData ? "Update" : "Create"} Path</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
