import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, FileText, Link2, Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AssignVehicleModal } from "@/components/modals/AssignVehicleModal";
import { CreateTripModal } from "@/components/modals/CreateTripModal";
import { RouteMap } from "@/components/map/RouteMap";
import { useToast } from "@/hooks/use-toast";
import type { Route, Vehicle, Driver, DailyTrip, DailyTripCreate, Deployment, DeploymentCreate, Stop, Path } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export default function BusDashboard() {
  const [trips, setTrips] = useState<DailyTrip[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<DailyTrip | null>(null);
  const [selectedTripRoute, setSelectedTripRoute] = useState<Route | null>(null);
  const [selectedTripStops, setSelectedTripStops] = useState<Stop[]>([]);
  const [selectedTripDeployments, setSelectedTripDeployments] = useState<Deployment[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createTripModalOpen, setCreateTripModalOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedTrip) {
      fetchTripDeployments(selectedTrip.trip_id);
      fetchAvailableResources(selectedTrip.trip_id);
      fetchTripRouteAndStops(selectedTrip.route_id);
    }
  }, [selectedTrip]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTrips(),
        fetchRoutes(),
        fetchVehicles(),
        fetchDrivers(),
        fetchDeployments(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_URL}/trips/all`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
        if (data.length > 0 && !selectedTrip) {
          setSelectedTrip(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await fetch(`${API_URL}/deployments/all`);
      if (response.ok) {
        const data = await response.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    }
  };

  const fetchTripDeployments = async (tripId: number) => {
    try {
      const response = await fetch(`${API_URL}/deployments/trip/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTripDeployments(data);
      }
    } catch (error) {
      console.error("Error fetching trip deployments:", error);
    }
  };

  const fetchAvailableResources = async (tripId: number) => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        fetch(`${API_URL}/deployments/trip/${tripId}/available-vehicles`),
        fetch(`${API_URL}/deployments/trip/${tripId}/available-drivers`),
      ]);
      
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setAvailableVehicles(vehiclesData);
      }
      
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setAvailableDrivers(driversData);
      }
    } catch (error) {
      console.error("Error fetching available resources:", error);
    }
  };

  const fetchTripRouteAndStops = async (routeId: number) => {
    setLoadingMap(true);
    try {
      // Fetch route details
      const routeResponse = await fetch(`${API_URL}/routes/${routeId}`);
      if (routeResponse.ok) {
        const routeData = await routeResponse.json();
        setSelectedTripRoute(routeData);

        // Fetch path with stops
        const pathResponse = await fetch(`${API_URL}/paths/${routeData.path_id}`);
        if (pathResponse.ok) {
          const pathData: Path = await pathResponse.json();
          
          // Fetch all stop details
          const stopPromises = pathData.stops
            .sort((a, b) => a.stop_order - b.stop_order)
            .map((pathStop) => 
              fetch(`${API_URL}/stops/${pathStop.stop_id}`).then(res => res.json())
            );
          
          const stopsData = await Promise.all(stopPromises);
          setSelectedTripStops(stopsData);
        }
      }
    } catch (error) {
      console.error("Error fetching route and stops:", error);
      toast({
        title: "Error",
        description: "Failed to load route map",
        variant: "destructive",
      });
    } finally {
      setLoadingMap(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/all`);
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/vehicles/all`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_URL}/drivers/all`);
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleAssignVehicle = async (data: DeploymentCreate) => {
    try {
      const response = await fetch(`${API_URL}/deployments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to assign vehicle");
      }

      toast({ title: "Vehicle and driver assigned successfully!" });
      setAssignModalOpen(false);
      
      // Refresh deployments
      fetchDeployments();
      if (selectedTrip) {
        fetchTripDeployments(selectedTrip.trip_id);
        fetchAvailableResources(selectedTrip.trip_id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign vehicle",
        variant: "destructive",
      });
    }
  };

  const handleCreateTrip = async (data: DailyTripCreate) => {
    try {
      const response = await fetch(`${API_URL}/trips/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create trip");
      }

      const newTrip = await response.json();
      setTrips([newTrip, ...trips]);
      toast({ 
        title: "Trip created successfully!",
        description: `${data.display_name} has been added to today's schedule.`
      });
      setCreateTripModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create trip",
        variant: "destructive",
      });
    }
  };

  // Filter trips based on search
  const filteredTrips = trips.filter((trip) =>
    trip.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.trip_id.toString().includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "success";
      case "in_progress":
      case "in-progress":
        return "warning";
      case "completed":
        return "muted";
      case "cancelled":
        return "destructive";
      default:
        return "muted";
    }
  };

  return (
    <>
    <DashboardLayout currentPage="busDashboard">
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
            {new Date().toLocaleDateString()}
          </Button>
          <Input 
            placeholder="Search trips by name or ID" 
            className="max-w-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="px-4 py-2 border border-border rounded-lg bg-background text-sm">
            <option>Filter by Route</option>
            {routes.map((route) => (
              <option key={route.route_id} value={route.route_id}>
                {route.route_display_name}
              </option>
            ))}
          </select>
          <Button variant="outline">Filters</Button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          className="gap-2 bg-primary hover:bg-primary-dark"
          onClick={() => setCreateTripModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Trip
        </Button>
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

          <div className="space-y-2 max-h-[750px] overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No trips found matching your search" : "No trips available"}
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.trip_id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-3 rounded-lg border border-border hover:shadow-card-hover transition-smooth cursor-pointer ${
                    selectedTrip?.trip_id === trip.trip_id ? "border-l-4 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{trip.display_name}</h4>
                      <p className="text-sm text-primary">{trip.booking_status_percentage.toFixed(0)}% booked</p>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${
                      getStatusColor(trip.live_status) === "success"
                        ? "bg-success/10 text-success"
                        : getStatusColor(trip.live_status) === "warning"
                        ? "bg-warning/10 text-warning"
                        : getStatusColor(trip.live_status) === "destructive"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted/10 text-muted-foreground"
                    }`}
                  >
                    {trip.live_status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Panel - Trip Details */}
        <Card className="p-6 lg:col-span-2">
          {!selectedTrip ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select a trip to view details</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{selectedTrip.display_name}</h2>
                  <Button variant="outline">
                    History
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div>
                    Trip ID: {selectedTrip.trip_id}
                  </div>
                  <div>Route ID: {selectedTrip.route_id}</div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {selectedTripDeployments.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {selectedTrip.booking_status_percentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Booked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {availableVehicles.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                      getStatusColor(selectedTrip.live_status) === "success"
                        ? "bg-success/10 text-success"
                        : getStatusColor(selectedTrip.live_status) === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted/10 text-muted-foreground"
                    }`}>
                      {selectedTrip.live_status.replace("_", " ").toUpperCase()}
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

              {/* Route Map */}
              <div className="mb-4">
                {loadingMap ? (
                  <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                      <p className="text-muted-foreground">Loading route map...</p>
                    </div>
                  </div>
                ) : selectedTripStops.length > 0 ? (
                  <RouteMap
                    stops={selectedTripStops}
                    routeName={selectedTripRoute?.route_display_name}
                    className="h-96"
                  />
                ) : (
                  <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No route data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Deployments List or Empty State */}
              {selectedTripDeployments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Vehicle not assigned yet</p>
                  <Button 
                    className="bg-primary hover:bg-primary-dark" 
                    onClick={() => {
                      if (selectedTrip) {
                        setAssignModalOpen(true);
                      }
                    }}
                  >
                    Assign Vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Assigned Vehicles ({selectedTripDeployments.length})</h3>
                    <Button 
                      size="sm"
                      onClick={() => setAssignModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assign More
                    </Button>
                  </div>
                  {selectedTripDeployments.map((deployment) => {
                    const vehicle = vehicles.find(v => v.vehicle_id === deployment.vehicle_id);
                    const driver = drivers.find(d => d.driver_id === deployment.driver_id);
                    return (
                      <div key={deployment.deployment_id} className="p-4 border border-border rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Vehicle</p>
                            <p className="font-semibold">{vehicle?.license_plate || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{vehicle?.type} - {vehicle?.capacity} seats</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Driver</p>
                            <p className="font-semibold">{driver?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{driver?.phone_number}</p>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">
                              Assigned
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
      </DashboardLayout>

      <AssignVehicleModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        onSubmit={handleAssignVehicle}
        tripId={selectedTrip?.trip_id || 0}
        availableVehicles={availableVehicles}
        availableDrivers={availableDrivers}
      />

      <CreateTripModal
        open={createTripModalOpen}
        onOpenChange={setCreateTripModalOpen}
        onSubmit={handleCreateTrip}
        availableRoutes={routes}
        availableVehicles={vehicles}
      />
    </>
  );
}
