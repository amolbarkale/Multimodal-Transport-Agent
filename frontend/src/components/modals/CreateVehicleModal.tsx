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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleCreate, VehicleType } from "@/types";

interface CreateVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleCreate) => void;
  editData?: VehicleCreate & { vehicle_id?: number };
}

export function CreateVehicleModal({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: CreateVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleCreate>(
    editData || {
      license_plate: "",
      type: VehicleType.BUS,
      capacity: 40,
      status: "active",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      license_plate: "",
      type: VehicleType.BUS,
      capacity: 40,
      status: "active",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
          <DialogDescription>
            {editData ? "Update vehicle information" : "Add a new vehicle to your fleet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="license_plate">License Plate *</Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                onChange={(e) =>
                  setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })
                }
                placeholder="e.g., KA-01-AB-1234"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Vehicle Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as VehicleType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VehicleType.BUS}>Bus</SelectItem>
                  <SelectItem value={VehicleType.CAB}>Cab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                placeholder="Number of seats"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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
            <Button type="submit">{editData ? "Update" : "Add"} Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
