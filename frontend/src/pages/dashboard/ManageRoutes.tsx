import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateRouteModal } from "@/components/modals/CreateRouteModal";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { useToast } from "@/components/ui/use-toast";
import { Path, Route, RouteCreate, Stop } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_URL = "http://127.0.0.1:8000";

export default function ManageRoutes() {
  const [routesList, setRoutesList] = useState<Route[]>([]);
  const [availablePaths, setAvailablePaths] = useState<Path[]>([]);
  const [availableStops, setAvailableStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "deactivated">("active");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [routesRes, pathsRes, stopsRes] = await Promise.all([
          fetch(`${API_URL}/routes?status=${activeTab}`),
          fetch(`${API_URL}/paths`),
          fetch(`${API_URL}/stops`)
        ]);

        if (!routesRes.ok) throw new Error("Failed to fetch routes");
        if (!pathsRes.ok) throw new Error("Failed to fetch paths");
        if (!stopsRes.ok) throw new Error("Failed to fetch stops");

        setRoutesList(await routesRes.json());
        setAvailablePaths(await pathsRes.json());
        setAvailableStops(await stopsRes.json());
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [activeTab, toast]);

  const handleCreateRoute = async (data: RouteCreate) => {
    try {
      const response = await fetch(`${API_URL}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to create route");
      }
      toast({ title: "Route created successfully!" });
      setCreateModalOpen(false);
      const routesRes = await fetch(`${API_URL}/routes?status=${activeTab}`);
      setRoutesList(await routesRes.json());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRoute = async () => {
    if (!deletingRouteId) return;
    try {
      const response = await fetch(`${API_URL}/routes/${deletingRouteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete route");
      toast({ title: "Route deleted successfully!" });
      setDeleteDialogOpen(false);
      setDeletingRouteId(null);
      setRoutesList(routesList.filter(r => r.route_id !== deletingRouteId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // --- THIS IS THE FIX ---
  const filteredRoutes = routesList.filter((route) =>
    route.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DashboardLayout>
        {/* Header and Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div><h1 className="text-3xl font-bold">Manage Routes</h1><p className="text-muted-foreground">Configure paths and schedules.</p></div>
            <Button onClick={() => setCreateModalOpen(true)}>+ Add Route</Button>
          </div>
          <Input placeholder="Search routes..." className="max-w-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="border-b mb-6"><div className="flex gap-6">
          <button onClick={() => setActiveTab("active")} className={`pb-3 border-b-2 font-semibold ${activeTab === "active" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Active Routes</button>
          <button onClick={() => setActiveTab("deactivated")} className={`pb-3 border-b-2 font-semibold ${activeTab === "deactivated" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Deactivated Routes</button>
        </div></div>

        {/* Data Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Route Name</TableHead><TableHead>Direction</TableHead><TableHead>Time</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredRoutes.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No routes found.</TableCell></TableRow>
              ) : (
                filteredRoutes.map((route) => (
                  <TableRow key={route.route_id}>
                    {/* --- THIS IS THE FIX --- */}
                    <TableCell className="font-semibold text-primary">{route.display_name}</TableCell>
                    <TableCell>{route.direction}</TableCell>
                    <TableCell>{route.shift_time}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDeletingRouteId(route.route_id); setDeleteDialogOpen(true); }} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
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
      </DashboardLayout>

      {/* Modals */}
      <CreateRouteModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSubmit={handleCreateRoute} availablePaths={availablePaths} availableStops={availableStops} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteRoute} title="Delete Route" description="Are you sure? This action cannot be undone." />
    </>
  );
}