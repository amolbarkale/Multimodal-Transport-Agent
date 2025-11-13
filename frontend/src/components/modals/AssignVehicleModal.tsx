import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { DeploymentCreate, Vehicle, Driver } from "@/types";

interface AssignVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeploymentCreate) => void;
  tripId?: number;
  availableVehicles?: Vehicle[];
  availableDrivers?: Driver[];
}

export function AssignVehicleModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  tripId = 0,
  availableVehicles = [],
  availableDrivers = []
}: AssignVehicleModalProps) {
  const [formData, setFormData] = useState<DeploymentCreate>({
    trip_id: tripId,
    vehicle_id: 0,
    driver_id: 0
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, trip_id: tripId }));
  }, [tripId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.vehicle_id === 0 || formData.driver_id === 0) {
      alert("Please select both a vehicle and a driver");
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Vehicle & Driver to Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Select Vehicle</Label>
            <Select 
              value={formData.vehicle_id.toString()} 
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id.toString()}>
                    {vehicle.license_plate} ({vehicle.type} - {vehicle.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Select Driver</Label>
            <Select 
              value={formData.driver_id.toString()} 
              onValueChange={(value) => setFormData({ ...formData, driver_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((driver) => (
                  <SelectItem key={driver.driver_id} value={driver.driver_id.toString()}>
                    {driver.name} - {driver.phone_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
