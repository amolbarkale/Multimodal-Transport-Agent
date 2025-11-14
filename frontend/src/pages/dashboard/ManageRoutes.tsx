import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Download, MoreVertical, Edit, Trash2, Copy, Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateRouteModal } from "@/components/modals/CreateRouteModal";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { RouteMapModal } from "@/components/modals/RouteMapModal";
import { useToast } from "@/hooks/use-toast";
import { Path, Route, RouteCreate, RouteStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_URL = import.meta.env.VITE_API_URL;

export default function ManageRoutes() {
  const [routesList, setRoutesList] = useState<Route[]>([]);
  const [availablePaths, setAvailablePaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "deactivated">("active");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<number | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedRouteForMap, setSelectedRouteForMap] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch routes and paths on mount
  useEffect(() => {
    fetchRoutes();
    fetchPaths();
  }, [activeTab]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const status = activeTab === "active" ? RouteStatus.ACTIVE : RouteStatus.DEACTIVATED;
      const response = await fetch(`${API_URL}/routes/all?status=${status}`);
      if (!response.ok) throw new Error("Failed to fetch routes");
      const data = await response.json();
      setRoutesList(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaths = async () => {
    try {
      setLoadingPaths(true);
      const response = await fetch(`${API_URL}/paths/all`);
      if (!response.ok) throw new Error("Failed to fetch paths");
      const data = await response.json();
      setAvailablePaths(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load paths",
        variant: "destructive",
      });
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleCreateRoute = async (data: RouteCreate) => {
    try {
      const response = await fetch(`${API_URL}/routes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create route");
      const newRoute = await response.json();
      setRoutesList([newRoute, ...routesList]);
      toast({ title: "Route created successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create route",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = async (data: RouteCreate) => {
    if (!editingRoute) return;
    try {
      const response = await fetch(`${API_URL}/routes/${editingRoute.route_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update route");
      const updatedRoute = await response.json();
      setRoutesList(routesList.map(r => r.route_id === editingRoute.route_id ? updatedRoute : r));
      setEditingRoute(null);
      toast({ title: "Route updated successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update route",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async () => {
    if (!deletingRouteId) return;
    try {
      const response = await fetch(`${API_URL}/routes/${deletingRouteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete route");
      setRoutesList(routesList.filter(r => r.route_id !== deletingRouteId));
      setDeleteDialogOpen(false);
      setDeletingRouteId(null);
      toast({ title: "Route deleted successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateRoute = async (route: Route) => {
    try {
      const duplicateData: RouteCreate = {
        path_id: route.path_id,
        route_display_name: `${route.route_display_name} (Copy)`,
        shift_time: route.shift_time,
        direction: route.direction,
        start_point: route.start_point,
        end_point: route.end_point,
        capacity: route.capacity,
        allocated_waitlist: route.allocated_waitlist,
        status: route.status,
      };
      
      const response = await fetch(`${API_URL}/routes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData),
      });
      
      if (!response.ok) throw new Error("Failed to duplicate route");
      const newRoute = await response.json();
      setRoutesList([newRoute, ...routesList]);
      toast({ title: "Route duplicated successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate route",
        variant: "destructive",
      });
    }
  };

  // Filter routes based on search term
  const filteredRoutes = routesList.filter((route) =>
    route.route_display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.route_id.toString().includes(searchTerm)
  );

  return (
    <>
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Routes</h1>
            <p className="text-muted-foreground">Configure paths, stops, and route schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              History
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button className="bg-primary hover:bg-primary-dark" onClick={() => setCreateModalOpen(true)}>+ Routes</Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <Input 
            placeholder="Search route name or ID" 
            className="max-w-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button 
            className={`pb-3 border-b-2 font-semibold ${
              activeTab === "active" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            } transition-fast`}
            onClick={() => setActiveTab("active")}
          >
            Active Routes
          </button>
          <button 
            className={`pb-3 border-b-2 font-semibold ${
              activeTab === "deactivated" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            } transition-fast`}
            onClick={() => setActiveTab("deactivated")}
          >
            Deactivated Routes
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold whitespace-nowrap">Route ID</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Route Name</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Direction</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Shift Time ↕</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Route Start Point</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Route End Point</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Capacity ↕</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Allowed Waitlist ↕</TableHead>
              <TableHead className="font-semibold whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No routes found matching your search" : "No routes available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.route_id} className="hover:bg-muted/30 transition-fast">
                  <TableCell className="font-mono text-sm">{route.route_id}</TableCell>
                  <TableCell className="font-semibold text-primary cursor-pointer hover:text-primary-dark">
                    {route.route_display_name}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted text-xs rounded">{route.direction}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{route.shift_time}</TableCell>
                  <TableCell className="text-sm">{route.start_point}</TableCell>
                  <TableCell className="text-sm">{route.end_point}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{route.capacity}</span>
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={async () => {
                          const newCapacity = prompt("Enter new capacity:", route.capacity.toString());
                          if (newCapacity !== null && !isNaN(parseInt(newCapacity))) {
                            try {
                              const response = await fetch(`${API_URL}/routes/${route.route_id}/capacity?capacity=${newCapacity}`, {
                                method: "PATCH",
                              });
                              if (!response.ok) throw new Error("Failed to update capacity");
                              const updated = await response.json();
                              setRoutesList(routesList.map(r => r.route_id === route.route_id ? updated : r));
                              toast({ title: "Capacity updated successfully!" });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to update capacity", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <Edit className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{route.allocated_waitlist}</span>
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={async () => {
                          const newWaitlist = prompt("Enter new waitlist:", route.allocated_waitlist.toString());
                          if (newWaitlist !== null && !isNaN(parseInt(newWaitlist))) {
                            try {
                              const response = await fetch(`${API_URL}/routes/${route.route_id}/waitlist?allocated_waitlist=${newWaitlist}`, {
                                method: "PATCH",
                              });
                              if (!response.ok) throw new Error("Failed to update waitlist");
                              const updated = await response.json();
                              setRoutesList(routesList.map(r => r.route_id === route.route_id ? updated : r));
                              toast({ title: "Waitlist updated successfully!" });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to update waitlist", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <Edit className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-fast">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedRouteForMap(route);
                          setMapModalOpen(true);
                        }}>
                          <MapPin className="w-4 h-4 mr-2" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingRoute(route)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Route
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateRoute(route)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={async () => {
                            const newStatus = activeTab === "active" ? RouteStatus.DEACTIVATED : RouteStatus.ACTIVE;
                            try {
                              const response = await fetch(`${API_URL}/routes/${route.route_id}/status?status=${newStatus}`, {
                                method: "PATCH",
                              });
                              if (!response.ok) throw new Error("Failed to update status");
                              // Remove from current list since it's now in the other tab
                              setRoutesList(routesList.filter(r => r.route_id !== route.route_id));
                              toast({ 
                                title: `Route ${activeTab === "active" ? "deactivated" : "activated"} successfully!` 
                              });
                            } catch (error) {
                              toast({ 
                                title: "Error", 
                                description: "Failed to update route status", 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          {activeTab === "active" ? (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeletingRouteId(route.route_id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {filteredRoutes.length} route{filteredRoutes.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select className="px-3 py-1 border border-border rounded text-sm">
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <div className="flex gap-1 ml-4">
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">&gt;</Button>
          </div>
          </div>
        </div>
      </DashboardLayout>

      <CreateRouteModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateRoute}
        availablePaths={availablePaths}
      />

      <CreateRouteModal
        open={!!editingRoute}
        onOpenChange={(open) => !open && setEditingRoute(null)}
        onSubmit={handleEditRoute}
        editData={editingRoute}
        availablePaths={availablePaths}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteRoute}
        title="Delete Route"
        description="Are you sure you want to delete this route? This action cannot be undone."
      />

      <RouteMapModal
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        route={selectedRouteForMap}
      />
    </>
  );
}
