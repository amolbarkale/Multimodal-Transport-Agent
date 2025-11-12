import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Download, MoreVertical, Edit, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { CreateRouteModal } from "@/components/modals/CreateRouteModal";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
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

const routes = [
  { id: "76918", name: "Path2 - 19:45", direction: "LOGIN", shiftTime: "19:45", start: "Gavipuram", end: "peenya", capacity: 0, waitlist: 0 },
  { id: "76919", name: "Path2 - 23:00", direction: "LOGIN", shiftTime: "23:00", start: "Gavipuram", end: "peenya", capacity: 0, waitlist: 0 },
  { id: "76917", name: "Path2 - 20:00", direction: "LOGIN", shiftTime: "20:00", start: "Gavipuram", end: "peenya", capacity: 0, waitlist: 0 },
  { id: "76920", name: "Path2 - 19:00", direction: "LOGIN", shiftTime: "19:00 (KS)", start: "Gavipuram", end: "peenya", capacity: 0, waitlist: 0 },
  { id: "76914", name: "Path1 - 21:00", direction: "LOGIN", shiftTime: "21:00", start: "Gavipuram", end: "Temple", capacity: 0, waitlist: 0 },
  { id: "76913", name: "Path1 - 20:00", direction: "LOGIN", shiftTime: "20:00", start: "Gavipuram", end: "Temple", capacity: 0, waitlist: 0 },
  { id: "76916", name: "Path1 - 23:00", direction: "LOGIN", shiftTime: "23:00", start: "Gavipuram", end: "Temple", capacity: 0, waitlist: 0 },
  { id: "76915", name: "Path1 - 22:00", direction: "LOGIN", shiftTime: "22:00", start: "Gavipuram", end: "Temple", capacity: 0, waitlist: 0 },
  { id: "76234", name: "paradise - 05:00", direction: "LOGIN", shiftTime: "05:00", start: "BTM", end: "NoShow", capacity: 6, waitlist: 0 },
  { id: "76912", name: "Dice", direction: "LOGIN", shiftTime: "18:00", start: "BTM", end: "NoShow", capacity: 6, waitlist: 0 },
];

export default function ManageRoutes() {
  const [routesList, setRoutesList] = useState(routes);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateRoute = (data: any) => {
    const newRoute = {
      id: String(Math.floor(Math.random() * 90000) + 10000),
      ...data
    };
    setRoutesList([newRoute, ...routesList]);
    toast({ title: "Route created successfully!" });
  };

  const handleEditRoute = (data: any) => {
    setRoutesList(routesList.map(r => r.id === editingRoute.id ? { ...r, ...data } : r));
    setEditingRoute(null);
    toast({ title: "Route updated successfully!" });
  };

  const handleDeleteRoute = () => {
    setRoutesList(routesList.filter(r => r.id !== deletingRouteId));
    setDeleteDialogOpen(false);
    setDeletingRouteId(null);
    toast({ title: "Route deleted successfully!" });
  };

  const handleDuplicateRoute = (route: any) => {
    const duplicated = {
      ...route,
      id: String(Math.floor(Math.random() * 90000) + 10000),
      name: `${route.name} (Copy)`
    };
    setRoutesList([duplicated, ...routesList]);
    toast({ title: "Route duplicated successfully!" });
  };

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
          <Input placeholder="Search route name or ID" className="max-w-xs" />
          <Button variant="outline">Filters</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button className="pb-3 border-b-2 border-primary text-primary font-semibold">
            Active Routes
          </button>
          <button className="pb-3 text-muted-foreground hover:text-foreground transition-fast">
            Deactivated Routes
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Route ID</TableHead>
              <TableHead className="font-semibold">Route Name</TableHead>
              <TableHead className="font-semibold">Direction</TableHead>
              <TableHead className="font-semibold">Shift Time ↕</TableHead>
              <TableHead className="font-semibold">Route Start Point</TableHead>
              <TableHead className="font-semibold">Route End Point</TableHead>
              <TableHead className="font-semibold">Capacity ↕</TableHead>
              <TableHead className="font-semibold">Allowed Waitlist ↕</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routesList.map((route, index) => (
              <TableRow key={route.id} className="hover:bg-muted/30 transition-fast">
                <TableCell className="font-mono text-sm">{route.id}</TableCell>
                <TableCell className="font-semibold text-primary cursor-pointer hover:text-primary-dark">
                  {route.name}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-muted text-xs rounded">{route.direction}</span>
                </TableCell>
                <TableCell className="font-mono text-sm">{route.shiftTime}</TableCell>
                <TableCell className="text-sm">{route.start}</TableCell>
                <TableCell className="text-sm">{route.end}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{route.capacity}</span>
                    <Edit className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{route.waitlist}</span>
                    <Edit className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
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
                      <DropdownMenuItem onClick={() => setEditingRoute(route)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Route
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateRoute(route)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setDeletingRouteId(route.id);
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing 1 - 25 of 63 items
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
      />

      <CreateRouteModal
        open={!!editingRoute}
        onOpenChange={(open) => !open && setEditingRoute(null)}
        onSubmit={handleEditRoute}
        editData={editingRoute}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteRoute}
        title="Delete Route"
        description="Are you sure you want to delete this route? This action cannot be undone."
      />
    </>
  );
}
