import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Car, Edit, Clock } from "lucide-react";

const vehicles = [
  { plate: "MH-12-3456", type: "Bus", capacity: 45, status: "Available", assignment: null },
  { plate: "KA-01-AB-1234", type: "Bus", capacity: 50, status: "Assigned", assignment: "Bulk - 00:01" },
  { plate: "TN-09-BC-5678", type: "Cab", capacity: 4, status: "Available", assignment: null },
  { plate: "KA-05-MN-9012", type: "Bus", capacity: 48, status: "Maintenance", assignment: null },
  { plate: "DL-3C-AA-2345", type: "Cab", capacity: 4, status: "Available", assignment: null },
  { plate: "MH-14-EF-6789", type: "Bus", capacity: 52, status: "Available", assignment: null },
  { plate: "KA-51-GH-3456", type: "Bus", capacity: 45, status: "Assigned", assignment: "Path1 - 20:00" },
  { plate: "TN-22-IJ-7890", type: "Cab", capacity: 4, status: "Available", assignment: null },
];

export default function Vehicles() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vehicle Fleet</h1>
            <p className="text-muted-foreground">Manage your transport fleet and assignments</p>
          </div>
          <Button className="bg-primary hover:bg-primary-dark">+ Add Vehicle</Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select className="px-4 py-2 border border-border rounded-lg bg-background text-sm">
            <option>All Types</option>
            <option>Bus</option>
            <option>Cab</option>
          </select>
          <select className="px-4 py-2 border border-border rounded-lg bg-background text-sm">
            <option>All Status</option>
            <option>Available</option>
            <option>Assigned</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle, index) => (
          <Card
            key={index}
            className="p-5 hover:shadow-card-hover transition-smooth group"
          >
            {/* Vehicle Icon */}
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
              {vehicle.type === "Bus" ? (
                <Bus className="w-16 h-16 text-muted-foreground" />
              ) : (
                <Car className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            {/* License Plate */}
            <h3 className="text-xl font-bold text-foreground mb-2">{vehicle.plate}</h3>

            {/* Type & Capacity */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-muted text-xs rounded">{vehicle.type}</span>
              <span className="text-sm text-muted-foreground">{vehicle.capacity} seats</span>
            </div>

            {/* Status */}
            <div className="mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  vehicle.status === "Available"
                    ? "bg-success/10 text-success"
                    : vehicle.status === "Assigned"
                    ? "bg-primary/10 text-primary"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {vehicle.status}
              </span>
            </div>

            {/* Assignment */}
            {vehicle.assignment && (
              <div className="text-sm text-muted-foreground mb-4">
                Assigned to: <span className="font-semibold text-foreground">{vehicle.assignment}</span>
              </div>
            )}

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
    </DashboardLayout>
  );
}
