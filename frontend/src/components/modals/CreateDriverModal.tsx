import { useState } from "react";
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
import { DriverCreate } from "@/types";

interface CreateDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DriverCreate) => void;
  editData?: DriverCreate & { driver_id?: number };
}

export function CreateDriverModal({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: CreateDriverModalProps) {
  const [formData, setFormData] = useState<DriverCreate>(
    editData || {
      name: "",
      phone_number: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phone_number: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Driver" : "Add New Driver"}</DialogTitle>
          <DialogDescription>
            {editData ? "Update driver information" : "Add a new driver to your team"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="e.g., +91-9876543210"
                required
              />
              <p className="text-xs text-muted-foreground">
                Phone number must be unique
              </p>
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
            <Button type="submit">{editData ? "Update" : "Add"} Driver</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
