import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { StopCreate, Stop } from "@/types";

interface CreateStopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StopCreate) => void;
  editData?: Stop;
}

export function CreateStopModal({ open, onOpenChange, onSubmit, editData }: CreateStopModalProps) {
  const [formData, setFormData] = useState<StopCreate>(editData ? {
    name: editData.name,
    latitude: editData.latitude,
    longitude: editData.longitude
  } : {
    name: "",
    latitude: 0,
    longitude: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Stop" : "Add New Stop"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Stop Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Gavipuram"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 12.9352"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 77.5931"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editData ? "Update" : "Add"} Stop</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
