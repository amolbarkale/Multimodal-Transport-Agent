import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateStopModal } from "@/components/modals/CreateStopModal";
import { CreatePathModal } from "@/components/modals/CreatePathModal";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Stop, Path, StopCreate, PathCreate } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export default function StopsPaths() {
  const [stopsList, setStopsList] = useState<Stop[]>([]);
  const [pathsList, setPathsList] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [pathModalOpen, setPathModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [editingPath, setEditingPath] = useState<Path | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"stop" | "path">("stop");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch stops and paths on mount
  useEffect(() => {
    fetchStops();
    fetchPaths();
  }, []);

  const fetchStops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stops/all`);
      if (!response.ok) throw new Error("Failed to fetch stops");
      const data = await response.json();
      setStopsList(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaths = async () => {
    try {
      const response = await fetch(`${API_URL}/paths/all`);
      if (!response.ok) throw new Error("Failed to fetch paths");
      const data = await response.json();
      setPathsList(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load paths",
        variant: "destructive",
      });
    }
  };

  const handleCreateStop = async (data: StopCreate) => {
    try {
      const response = await fetch(`${API_URL}/stops/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create stop");
      const newStop = await response.json();
      setStopsList([...stopsList, newStop]);
      toast({ title: "Stop created successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create stop",
        variant: "destructive",
      });
    }
  };

  const handleEditStop = async (data: StopCreate) => {
    if (!editingStop) return;
    try {
      const response = await fetch(`${API_URL}/stops/${editingStop.stop_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update stop");
      const updatedStop = await response.json();
      setStopsList(stopsList.map((s) => s.stop_id === editingStop.stop_id ? updatedStop : s));
      setEditingStop(null);
      toast({ title: "Stop updated successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stop",
        variant: "destructive",
      });
    }
  };

  const handleCreatePath = async (data: PathCreate) => {
    try {
      const response = await fetch(`${API_URL}/paths/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create path");
      const newPath = await response.json();
      setPathsList([...pathsList, newPath]);
      toast({ title: "Path created successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create path",
        variant: "destructive",
      });
    }
  };

  const handleEditPath = async (data: PathCreate) => {
    if (!editingPath) return;
    try {
      const response = await fetch(`${API_URL}/paths/${editingPath.path_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update path");
      const updatedPath = await response.json();
      setPathsList(pathsList.map((p) => p.path_id === editingPath.path_id ? updatedPath : p));
      setEditingPath(null);
      toast({ title: "Path updated successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update path",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "stop") {
        const response = await fetch(`${API_URL}/stops/${deletingId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete stop");
        setStopsList(stopsList.filter((s) => s.stop_id !== deletingId));
        toast({ title: "Stop deleted successfully!" });
      } else {
        const response = await fetch(`${API_URL}/paths/${deletingId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete path");
        setPathsList(pathsList.filter((p) => p.path_id !== deletingId));
        toast({ title: "Path deleted successfully!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${deleteType}`,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  // Filter stops based on search
  const filteredStops = stopsList.filter((stop) =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
    <DashboardLayout currentPage="stopsPaths">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Stops & Paths</h1>
        <p className="text-muted-foreground">Manage stop locations and path configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Stops */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Stops</h3>
              <Button size="sm" className="bg-primary hover:bg-primary-dark" onClick={() => setStopModalOpen(true)}>
                + Add Stop
              </Button>
            </div>

            <Input 
              placeholder="Search stops" 
              className="mb-4" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredStops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No stops found matching your search" : "No stops available. Add one to get started!"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStops.map((stop) => (
                  <Card
                    key={stop.stop_id}
                    className="p-4 hover:shadow-card-hover transition-smooth cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{stop.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{stop.latitude.toFixed(4)}° N, {stop.longitude.toFixed(4)}° E</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                        <button 
                          className="p-1 hover:bg-muted rounded"
                          onClick={() => setEditingStop(stop)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          className="p-1 hover:bg-muted rounded"
                          onClick={() => {
                            setDeleteType("stop");
                            setDeletingId(stop.stop_id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Paths */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Paths</h3>
              <Button size="sm" className="bg-primary hover:bg-primary-dark" onClick={() => setPathModalOpen(true)}>
                + Create Path
              </Button>
            </div>

            {pathsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No paths available. Create one to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {pathsList.map((path) => (
                  <Card
                    key={path.path_id}
                    className="p-5 hover:shadow-card-hover transition-smooth group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-lg text-foreground">{path.path_name}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                        <button 
                          className="p-1 hover:bg-muted rounded"
                          onClick={() => setEditingPath(path)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          className="p-1 hover:bg-muted rounded"
                          onClick={() => {
                            setDeleteType("path");
                            setDeletingId(path.path_id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {path.stops.map((pathStop, stopIndex) => {
                        const stopInfo = stopsList.find(s => s.stop_id === pathStop.stop_id);
                        return (
                          <div key={stopIndex} className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-muted text-sm font-medium rounded-lg">
                              {stopInfo?.name || `Stop ${pathStop.stop_id}`}
                            </span>
                            {stopIndex < path.stops.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {path.stops.length} stop{path.stops.length !== 1 ? "s" : ""}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>

    <CreateStopModal
      open={stopModalOpen}
      onOpenChange={setStopModalOpen}
      onSubmit={handleCreateStop}
    />

    <CreateStopModal
      open={!!editingStop}
      onOpenChange={(open) => !open && setEditingStop(null)}
      onSubmit={handleEditStop}
      editData={editingStop || undefined}
    />

    <CreatePathModal
      open={pathModalOpen}
      onOpenChange={setPathModalOpen}
      onSubmit={handleCreatePath}
      availableStops={stopsList}
    />

    <CreatePathModal
      open={!!editingPath}
      onOpenChange={(open) => !open && setEditingPath(null)}
      onSubmit={handleEditPath}
      editData={editingPath || undefined}
      availableStops={stopsList}
    />

    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDelete}
      title={`Delete ${deleteType === "stop" ? "Stop" : "Path"}`}
      description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
    />
    </>
  );
}
