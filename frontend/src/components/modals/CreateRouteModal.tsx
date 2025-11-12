import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CreateRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export function CreateRouteModal({ open, onOpenChange, onSubmit, editData }: CreateRouteModalProps) {
  const [formData, setFormData] = useState(editData || {
    name: "",
    path: "",
    shiftTime: "",
    direction: "LOGIN",
    startPoint: "",
    endPoint: "",
    capacity: "",
    waitlist: ""
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
          <DialogTitle>{editData ? "Edit Route" : "Create New Route"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Path1 - 20:00"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Select value={formData.path} onValueChange={(value) => setFormData({ ...formData, path: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select path" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Path1">Path1</SelectItem>
                  <SelectItem value="Path2">Path2</SelectItem>
                  <SelectItem value="paradise">paradise</SelectItem>
                  <SelectItem value="Dice">Dice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftTime">Shift Time</Label>
              <Input
                id="shiftTime"
                type="time"
                value={formData.shiftTime}
                onChange={(e) => setFormData({ ...formData, shiftTime: e.target.value })}
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
              <Label htmlFor="startPoint">Start Point</Label>
              <Input
                id="startPoint"
                value={formData.startPoint}
                onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                placeholder="e.g., Gavipuram"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endPoint">End Point</Label>
              <Input
                id="endPoint"
                value={formData.endPoint}
                onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                placeholder="e.g., Temple"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waitlist">Allowed Waitlist</Label>
              <Input
                id="waitlist"
                type="number"
                value={formData.waitlist}
                onChange={(e) => setFormData({ ...formData, waitlist: e.target.value })}
                placeholder="0"
                required
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
