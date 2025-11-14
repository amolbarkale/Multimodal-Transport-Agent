import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, MoreVertical, Phone, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateDriverModal } from "@/components/modals/CreateDriverModal";
import { useToast } from "@/hooks/use-toast";
import type { DriverCreate, Driver } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/drivers`);
      if (!response.ok) throw new Error("Failed to fetch drivers");
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (data: DriverCreate) => {
    try {
      const response = await fetch(`${API_URL}/drivers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create driver");
      }

      const newDriver = await response.json();
      setDrivers([...drivers, newDriver]);
      toast({
        title: "Driver added successfully!",
        description: `${data.name} has been added to your team.`,
      });
      setCreateModalOpen(false);
    } catch (error: any) {
      console.error("Error creating driver:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create driver",
        variant: "destructive",
      });
    }
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone_number.includes(searchTerm)
  );

  return (
    <>
      <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Driver Management</h1>
            <p className="text-muted-foreground">Manage driver profiles and assignments</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-dark gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Input 
            placeholder="Search drivers..." 
            className="max-w-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table View */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading drivers...</p>
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No drivers found</p>
            </div>
          </div>
        ) : (
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Driver ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone Number</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver) => (
              <TableRow key={driver.driver_id} className="hover:bg-muted/30 transition-fast">
                <TableCell className="font-mono text-sm">#{driver.driver_id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {driver.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-semibold text-foreground">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {driver.phone_number}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-muted rounded transition-fast">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded transition-fast">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
      </DashboardLayout>

      <CreateDriverModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateDriver}
      />
    </>
  );
}
