import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X, Plus } from "lucide-react";

interface CreatePathModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

const availableStops = ["Gavipuram", "Temple", "Peenya", "BTM", "Hongsandra", "NoShow"];

export function CreatePathModal({ open, onOpenChange, onSubmit, editData }: CreatePathModalProps) {
  const [formData, setFormData] = useState(editData || {
    name: "",
    stops: ["", ""]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const addStop = () => {
    setFormData({ ...formData, stops: [...formData.stops, ""] });
  };

  const removeStop = (index: number) => {
    if (formData.stops.length > 2) {
      const newStops = formData.stops.filter((_: any, i: number) => i !== index);
      setFormData({ ...formData, stops: newStops });
    }
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...formData.stops];
    newStops[index] = value;
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
            <Label htmlFor="name">Path Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Path1"
              required
            />
          </div>
          
          <div className="space-y-3">
            <Label>Stops (in order)</Label>
            {formData.stops.map((stop: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                <select
                  value={stop}
                  onChange={(e) => updateStop(index, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select stop</option>
                  {availableStops.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
