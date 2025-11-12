import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, MapPin, FileText, Link2, Clock, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { AssignVehicleModal } from "@/components/modals/AssignVehicleModal";
import { useToast } from "@/hooks/use-toast";

const metrics = [
  { icon: "🚌", label: "Vehicles Not Assigned", value: 42, trend: "+12", trendUp: true },
  { icon: "📋", label: "Trips Not Generated", value: 43, trend: "-5", trendUp: false },
  { icon: "👥", label: "Employees Scheduled", value: 11, status: "Active" },
  { icon: "🔄", label: "Ongoing Trips", value: 1, pulse: true },
];

const trips = [
  { name: "Bulk - 00:01", booked: "0%", status: "00:01 IN", statusColor: "success" },
  { name: "Path Path - 00:02", booked: "0%", status: "00:02 IN", statusColor: "success" },
  { name: "Path Path - 00:10", booked: "0%", status: "00:10 IN", statusColor: "success", badge: "bn" },
  { name: "Geoone - 00:59", booked: "0%", status: "00:59 OUT", statusColor: "warning" },
  { name: "AVX - 05:15", booked: "0%", status: "05:15 IN", statusColor: "success" },
  { name: "NoShow - BTS - 13:00", booked: "50%", status: "13:00 OUT", statusColor: "destructive" },
];

export default function BusDashboard() {
  const [selectedTrip, setSelectedTrip] = useState(trips[0]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAssignVehicle = (data: any) => {
    toast({ title: "Vehicle assigned successfully!" });
  };

  return (
    <>
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bus Dashboard</h1>
            <p className="text-muted-foreground">Manage daily trip operations and vehicle assignments</p>
          </div>
          <a href="#" className="text-sm text-primary hover:text-primary-dark transition-fast">
            Switch to Old UI
          </a>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            07/11/2025
          </Button>
          <Input placeholder="Search trips by name or ID" className="max-w-xs" />
          <select className="px-4 py-2 border border-border rounded-lg bg-background text-sm">
            <option>Filter by Route</option>
          </select>
          <Button variant="outline">Filters</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-card-hover transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{metric.icon}</div>
              <Download className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-fast" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-2">{metric.value}</div>
            <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
            {metric.trend && (
              <div className={`text-sm flex items-center gap-1 ${metric.trendUp ? "text-success" : "text-destructive"}`}>
                {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metric.trend} from yesterday
              </div>
            )}
            {metric.status && (
              <span className="inline-block px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                {metric.status}
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" className="gap-2">
          <MapPin className="w-4 h-4" />
          Track Route
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Tripsheet
        </Button>
        <Button variant="outline" className="gap-2">
          <Link2 className="w-4 h-4" />
          Merge Route
        </Button>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Trip List */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Today's Trips</h3>
            <select className="text-sm border border-border rounded px-2 py-1">
              <option>Sort by</option>
            </select>
          </div>

          <div className="space-y-2">
            {trips.map((trip, index) => (
              <div
                key={index}
                onClick={() => setSelectedTrip(trip)}
                className={`p-3 rounded-lg border border-border hover:shadow-card-hover transition-smooth cursor-pointer ${
                  selectedTrip.name === trip.name ? "border-l-4 border-l-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{trip.name}</h4>
                    <p className="text-sm text-primary">{trip.booked} booked</p>
                  </div>
                  {trip.badge && (
                    <span className="px-2 py-1 bg-muted text-xs rounded">{trip.badge}</span>
                  )}
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs ${
                    trip.statusColor === "success"
                      ? "bg-success/10 text-success"
                      : trip.statusColor === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Panel - Trip Details */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">{selectedTrip.name}</h2>
              <Button variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                History
              </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                23:12 - 00:01
              </div>
              <div>Planned Capacity: N/A</div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">On-time</div>
              </div>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-sm font-semibold rounded">
                  W/L 0
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-6">
              <button className="pb-3 border-b-2 border-primary text-primary font-semibold">
                Manage Vehicles
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground transition-fast">
                Manage Bookings
              </button>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-muted rounded-lg h-64 mb-4 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Route Map</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚌❓</div>
            <p className="text-muted-foreground mb-4">Vehicle not assigned yet</p>
            <Button className="bg-primary hover:bg-primary-dark" onClick={() => setAssignModalOpen(true)}>Assign Vehicle</Button>
          </div>
        </Card>
      </div>
      </DashboardLayout>

      <AssignVehicleModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        onSubmit={handleAssignVehicle}
      />
    </>
  );
}
