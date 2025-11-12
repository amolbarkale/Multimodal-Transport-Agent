import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Performance metrics and insights</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Trips</div>
          <div className="text-3xl font-bold text-foreground mb-1">1,247</div>
          <div className="text-sm text-success">+12% from last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Distance</div>
          <div className="text-3xl font-bold text-foreground mb-1">45,678 km</div>
          <div className="text-sm text-success">+8% from last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">On-Time Performance</div>
          <div className="text-3xl font-bold text-foreground mb-1">94.2%</div>
          <div className="text-sm text-success">+2.1% from last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Booking Rate</div>
          <div className="text-3xl font-bold text-foreground mb-1">87.5%</div>
          <div className="text-sm text-destructive">-3% from last month</div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Daily Trips</h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Line chart visualization</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Bookings by Route</h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Bar chart visualization</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Vehicle Utilization</h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Pie chart visualization</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Peak Hours</h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Heatmap visualization</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
