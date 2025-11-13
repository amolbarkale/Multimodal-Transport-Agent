import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, Bus, Users, MapPin, Route as RouteIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Route, Vehicle, Driver, DailyTrip, Deployment, Stop, Path } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

interface AnalyticsData {
  totalTrips: number;
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  totalRoutes: number;
  activeRoutes: number;
  totalStops: number;
  totalPaths: number;
  totalDeployments: number;
  avgBookingRate: number;
  scheduledTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  cancelledTrips: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTrips: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalStops: 0,
    totalPaths: 0,
    totalDeployments: 0,
    avgBookingRate: 0,
    scheduledTrips: 0,
    inProgressTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
  });
  const [trips, setTrips] = useState<DailyTrip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tripsRes, routesRes, vehiclesRes, driversRes, stopsRes, pathsRes, deploymentsRes] = await Promise.all([
        fetch(`${API_URL}/trips/all`),
        fetch(`${API_URL}/routes/all`),
        fetch(`${API_URL}/vehicles/all`),
        fetch(`${API_URL}/drivers/all`),
        fetch(`${API_URL}/stops/all`),
        fetch(`${API_URL}/paths/all`),
        fetch(`${API_URL}/deployments/all`),
      ]);

      const tripsData: DailyTrip[] = await tripsRes.json();
      const routesData: Route[] = await routesRes.json();
      const vehiclesData: Vehicle[] = await vehiclesRes.json();
      const driversData: Driver[] = await driversRes.json();
      const stopsData: Stop[] = await stopsRes.json();
      const pathsData: Path[] = await pathsRes.json();
      const deploymentsData: Deployment[] = await deploymentsRes.json();

      setTrips(tripsData);
      setRoutes(routesData);
      setVehicles(vehiclesData);

      // Calculate analytics
      const avgBooking = tripsData.length > 0
        ? tripsData.reduce((sum, trip) => sum + trip.booking_status_percentage, 0) / tripsData.length
        : 0;

      setAnalytics({
        totalTrips: tripsData.length,
        totalVehicles: vehiclesData.length,
        activeVehicles: vehiclesData.filter(v => v.status === "active").length,
        totalDrivers: driversData.length,
        totalRoutes: routesData.length,
        activeRoutes: routesData.filter(r => r.status === "active").length,
        totalStops: stopsData.length,
        totalPaths: pathsData.length,
        totalDeployments: deploymentsData.length,
        avgBookingRate: avgBooking,
        scheduledTrips: tripsData.filter(t => t.live_status === "scheduled").length,
        inProgressTrips: tripsData.filter(t => t.live_status === "in_progress" || t.live_status === "in-progress").length,
        completedTrips: tripsData.filter(t => t.live_status === "completed").length,
        cancelledTrips: tripsData.filter(t => t.live_status === "cancelled").length,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Real-time performance metrics and insights</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchAllData} disabled={loading}>
            <Calendar className="w-4 h-4" />
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Total Trips</div>
                <Bus className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{analytics.totalTrips}</div>
              <div className="text-sm flex items-center gap-2">
                <span className={analytics.scheduledTrips > 0 ? "text-green-600" : "text-muted-foreground"}>
                  {analytics.scheduledTrips} scheduled
                </span>
                <span className="text-muted-foreground">•</span>
                <span className={analytics.inProgressTrips > 0 ? "text-blue-600" : "text-muted-foreground"}>
                  {analytics.inProgressTrips} active
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Total Vehicles</div>
                <Bus className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{analytics.totalVehicles}</div>
              <div className="text-sm flex items-center gap-2">
                <span className={analytics.activeVehicles > 0 ? "text-green-600" : "text-muted-foreground"}>
                  {analytics.activeVehicles} active
                </span>
                <span className="text-muted-foreground">•</span>
                <span className={analytics.totalVehicles - analytics.activeVehicles > 0 ? "text-orange-600" : "text-muted-foreground"}>
                  {analytics.totalVehicles - analytics.activeVehicles} inactive
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Avg Booking Rate</div>
                {analytics.avgBookingRate >= 70 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{analytics.avgBookingRate.toFixed(1)}%</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${analytics.avgBookingRate >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${analytics.avgBookingRate}%` }}
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Active Deployments</div>
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{analytics.totalDeployments}</div>
              <div className="text-sm text-muted-foreground">
                {analytics.totalDrivers} total drivers
              </div>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Routes & Paths</h3>
                <RouteIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Routes</span>
                  <span className="text-lg font-bold">{analytics.totalRoutes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Routes</span>
                  <span className="text-lg font-bold text-green-600">{analytics.activeRoutes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Paths</span>
                  <span className="text-lg font-bold">{analytics.totalPaths}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Stops Network</h3>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Stops</span>
                  <span className="text-lg font-bold">{analytics.totalStops}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Stops/Path</span>
                  <span className="text-lg font-bold">
                    {analytics.totalPaths > 0 ? (analytics.totalStops / analytics.totalPaths).toFixed(1) : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network Coverage</span>
                  <span className={`text-lg font-bold ${analytics.totalStops > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {analytics.totalStops > 0 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Trip Status</h3>
                <Bus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="text-lg font-bold text-blue-600">{analytics.scheduledTrips}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-lg font-bold text-green-600">{analytics.inProgressTrips}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-lg font-bold text-gray-600">{analytics.completedTrips}</span>
                </div>
              </div>
            </Card>
          </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Trips by Status</h3>
          <div className="space-y-4">
            {/* Scheduled */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="text-sm font-semibold text-blue-600">{analytics.scheduledTrips}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: analytics.totalTrips > 0 ? `${(analytics.scheduledTrips / analytics.totalTrips) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-semibold text-green-600">{analytics.inProgressTrips}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: analytics.totalTrips > 0 ? `${(analytics.inProgressTrips / analytics.totalTrips) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-semibold text-gray-600">{analytics.completedTrips}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-500 transition-all"
                  style={{ width: analytics.totalTrips > 0 ? `${(analytics.completedTrips / analytics.totalTrips) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Cancelled */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className="text-sm font-semibold text-red-600">{analytics.cancelledTrips}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all"
                  style={{ width: analytics.totalTrips > 0 ? `${(analytics.cancelledTrips / analytics.totalTrips) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top 5 Routes by Bookings</h3>
          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No trip data available
              </div>
            ) : (
              trips
                .sort((a, b) => b.booking_status_percentage - a.booking_status_percentage)
                .slice(0, 5)
                .map((trip, idx) => (
                  <div key={trip.trip_id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {idx + 1}. {trip.display_name}
                      </span>
                      <span className="text-sm font-semibold ml-2">{trip.booking_status_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          trip.booking_status_percentage >= 80 ? 'bg-green-500' :
                          trip.booking_status_percentage >= 50 ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${trip.booking_status_percentage}%` }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Vehicle Utilization</h3>
          <div className="space-y-6">
            {/* Active Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Active Vehicles</span>
                <span className="text-2xl font-bold text-green-600">{analytics.activeVehicles}</span>
              </div>
              <div className="relative pt-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: analytics.totalVehicles > 0 ? `${(analytics.activeVehicles / analytics.totalVehicles) * 100}%` : '0%' }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics.totalVehicles > 0 ? ((analytics.activeVehicles / analytics.totalVehicles) * 100).toFixed(1) : '0'}% utilization
                </div>
              </div>
            </div>

            {/* Deployed Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Deployed Vehicles</span>
                <span className="text-2xl font-bold text-blue-600">{analytics.totalDeployments}</span>
              </div>
              <div className="relative pt-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: analytics.totalVehicles > 0 ? `${(analytics.totalDeployments / analytics.totalVehicles) * 100}%` : '0%' }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics.totalVehicles > 0 ? ((analytics.totalDeployments / analytics.totalVehicles) * 100).toFixed(1) : '0'}% deployed
                </div>
              </div>
            </div>

            {/* Available Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Available Vehicles</span>
                <span className="text-2xl font-bold text-purple-600">{analytics.activeVehicles - analytics.totalDeployments}</span>
              </div>
              <div className="relative pt-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: analytics.totalVehicles > 0 ? `${((analytics.activeVehicles - analytics.totalDeployments) / analytics.totalVehicles) * 100}%` : '0%' }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics.totalVehicles > 0 ? (((analytics.activeVehicles - analytics.totalDeployments) / analytics.totalVehicles) * 100).toFixed(1) : '0'}% available
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Route Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Routes</div>
                <div className="text-2xl font-bold">{analytics.totalRoutes}</div>
              </div>
              <RouteIcon className="h-8 w-8 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Active Routes</div>
                <div className="text-2xl font-bold text-green-600">{analytics.activeRoutes}</div>
              </div>
              <div className="text-sm font-medium text-green-600">
                {analytics.totalRoutes > 0 ? ((analytics.activeRoutes / analytics.totalRoutes) * 100).toFixed(0) : '0'}%
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Avg Booking Rate</div>
                <div className="text-2xl font-bold">{analytics.avgBookingRate.toFixed(1)}%</div>
              </div>
              {analytics.avgBookingRate >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-orange-500" />
              )}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Network Coverage</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">{analytics.totalStops} stops</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  across {analytics.totalPaths} paths
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
          </>
        )}
    </DashboardLayout>
  );
}
