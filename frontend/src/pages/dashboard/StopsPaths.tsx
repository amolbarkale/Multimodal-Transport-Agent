import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Edit, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { CreateStopModal } from "@/components/modals/CreateStopModal";
import { CreatePathModal } from "@/components/modals/CreatePathModal";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const stops = [
  { name: "Gavipuram", lat: "12.9352° N", lng: "77.5931° E", routes: 8 },
  { name: "Temple", lat: "12.9375° N", lng: "77.5945° E", routes: 4 },
  { name: "Peenya", lat: "13.0318° N", lng: "77.5165° E", routes: 5 },
  { name: "BTM", lat: "12.9165° N", lng: "77.6101° E", routes: 2 },
  { name: "Hongsandra", lat: "12.9702° N", lng: "77.7499° E", routes: 1 },
  { name: "NoShow", lat: "12.9165° N", lng: "77.6101° E", routes: 2 },
];

const paths = [
  { name: "Path1", stops: ["Gavipuram", "Temple"], routes: 4 },
  { name: "Path2", stops: ["Gavipuram", "Peenya"], routes: 4 },
  { name: "paradise", stops: ["BTM", "NoShow"], routes: 1 },
  { name: "Dice", stops: ["BTM", "NoShow"], routes: 1 },
];

export default function StopsPaths() {
  const [stopsList, setStopsList] = useState(stops);
  const [pathsList, setPathsList] = useState(paths);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [pathModalOpen, setPathModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<any>(null);
  const [editingPath, setEditingPath] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"stop" | "path">("stop");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCreateStop = (data: any) => {
    setStopsList([...stopsList, { ...data, routes: 0 }]);
    toast({ title: "Stop created successfully!" });
  };

  const handleEditStop = (data: any) => {
    setStopsList(stopsList.map((s, i) => i === editingStop.index ? { ...s, ...data } : s));
    setEditingStop(null);
    toast({ title: "Stop updated successfully!" });
  };

  const handleCreatePath = (data: any) => {
    setPathsList([...pathsList, { ...data, routes: 0 }]);
    toast({ title: "Path created successfully!" });
  };

  const handleEditPath = (data: any) => {
    setPathsList(pathsList.map((p, i) => i === editingPath.index ? { ...p, ...data } : p));
    setEditingPath(null);
    toast({ title: "Path updated successfully!" });
  };

  const handleDelete = () => {
    if (deleteType === "stop") {
      setStopsList(stopsList.filter((_, i) => i !== deletingId));
      toast({ title: "Stop deleted successfully!" });
    } else {
      setPathsList(pathsList.filter((_, i) => i !== deletingId));
      toast({ title: "Path deleted successfully!" });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <>
    <DashboardLayout>
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

            <Input placeholder="Search stops" className="mb-4" />

            <div className="space-y-3">
              {stopsList.map((stop, index) => (
                <Card
                  key={index}
                  className="p-4 hover:shadow-card-hover transition-smooth cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{stop.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{stop.lat}, {stop.lng}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={() => setEditingStop({ ...stop, index })}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={() => {
                          setDeleteType("stop");
                          setDeletingId(index);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {stop.routes} routes
                  </span>
                </Card>
              ))}
            </div>
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

            <div className="space-y-4">
              {pathsList.map((path, index) => (
                <Card
                  key={index}
                  className="p-5 hover:shadow-card-hover transition-smooth group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg text-foreground">{path.name}</h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={() => setEditingPath({ ...path, index })}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="p-1 hover:bg-muted rounded"
                        onClick={() => {
                          setDeleteType("path");
                          setDeletingId(index);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {path.stops.map((stop, stopIndex) => (
                      <div key={stopIndex} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-muted text-sm font-medium rounded-lg">
                          {stop}
                        </span>
                        {stopIndex < path.stops.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>

                  <span className="text-sm text-muted-foreground">
                    Used in {path.routes} route{path.routes !== 1 ? "s" : ""}
                  </span>
                </Card>
              ))}
            </div>
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
      editData={editingStop}
    />

    <CreatePathModal
      open={pathModalOpen}
      onOpenChange={setPathModalOpen}
      onSubmit={handleCreatePath}
    />

    <CreatePathModal
      open={!!editingPath}
      onOpenChange={(open) => !open && setEditingPath(null)}
      onSubmit={handleEditPath}
      editData={editingPath}
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
