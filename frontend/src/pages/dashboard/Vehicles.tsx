import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Car, Edit, Clock, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateVehicleModal } from "@/components/modals/CreateVehicleModal";
import { useToast } from "@/hooks/use-toast";
import type { VehicleCreate, Vehicle } from "@/types";
import { VehicleType } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vehicles`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (data: VehicleCreate) => {
    try {
      const response = await fetch(`${API_URL}/vehicles/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create vehicle");
      }

      const newVehicle = await response.json();
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Vehicle added successfully!",
        description: `${data.license_plate} has been added to your fleet.`,
      });
      setCreateModalOpen(false);
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle",
        variant: "destructive",
      });
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const typeMatch = filterType === "all" || vehicle.type === filterType;
    const statusMatch = filterStatus === "all" || vehicle.status === filterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <>
      <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vehicle Fleet</h1>
            <p className="text-muted-foreground">Manage your transport fleet and assignments</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-dark gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            className="px-4 py-2 border border-border rounded-lg bg-background text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value={VehicleType.BUS}>Bus</option>
            <option value={VehicleType.CAB}>Cab</option>
          </select>
          <select 
            className="px-4 py-2 border border-border rounded-lg bg-background text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card
            key={vehicle.vehicle_id}
            className="p-5 hover:shadow-card-hover transition-smooth group"
          >
            {/* Vehicle Icon */}
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
              {vehicle.type === VehicleType.BUS ? (
                <Bus className="w-16 h-16 text-muted-foreground" />
              ) : (
                <Car className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            {/* License Plate */}
            <h3 className="text-xl font-bold text-foreground mb-2">{vehicle.license_plate}</h3>

            {/* Type & Capacity */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-muted text-xs rounded">{vehicle.type}</span>
              <span className="text-sm text-muted-foreground">{vehicle.capacity} seats</span>
            </div>

            {/* Status */}
            <div className="mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.status === "active"
                    ? "bg-success/10 text-success"
                    : vehicle.status === "inactive"
                    ? "bg-muted text-muted-foreground"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {vehicle.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-fast">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      )}
      </DashboardLayout>

      <CreateVehicleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateVehicle}
      />
    </>
  );
}
