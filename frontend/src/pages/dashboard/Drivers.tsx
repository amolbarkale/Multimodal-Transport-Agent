import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, MoreVertical, Phone } from "lucide-react";

const drivers = [
  { id: "D001", name: "Amit Kumar", phone: "+91 98765 43210", license: "DL-12345", status: "Active", assignment: "Bulk - 00:01" },
  { id: "D002", name: "Rajesh Sharma", phone: "+91 98765 43211", license: "DL-12346", status: "Active", assignment: "Not assigned" },
  { id: "D003", name: "Priya Singh", phone: "+91 98765 43212", license: "DL-12347", status: "Active", assignment: "Path1 - 20:00" },
  { id: "D004", name: "Vikram Patel", phone: "+91 98765 43213", license: "DL-12348", status: "Inactive", assignment: "Not assigned" },
  { id: "D005", name: "Sneha Reddy", phone: "+91 98765 43214", license: "DL-12349", status: "Active", assignment: "Not assigned" },
  { id: "D006", name: "Arjun Verma", phone: "+91 98765 43215", license: "DL-12350", status: "Active", assignment: "Path2 - 19:45" },
  { id: "D007", name: "Kavita Nair", phone: "+91 98765 43216", license: "DL-12351", status: "Active", assignment: "Not assigned" },
  { id: "D008", name: "Rohit Desai", phone: "+91 98765 43217", license: "DL-12352", status: "Active", assignment: "Not assigned" },
];

export default function Drivers() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Driver Management</h1>
            <p className="text-muted-foreground">Manage driver profiles and assignments</p>
          </div>
          <Button className="bg-primary hover:bg-primary-dark">+ Add Driver</Button>
        </div>

        <div className="flex items-center gap-3">
          <Input placeholder="Search drivers..." className="max-w-xs" />
          <Button variant="outline">Filters</Button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Driver ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone Number</TableHead>
              <TableHead className="font-semibold">License Number</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Current Assignment</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} className="hover:bg-muted/30 transition-fast">
                <TableCell className="font-mono text-sm">{driver.id}</TableCell>
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
                    {driver.phone}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{driver.license}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      driver.status === "Active"
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {driver.status}
                  </span>
                </TableCell>
                <TableCell>
                  {driver.assignment === "Not assigned" ? (
                    <span className="text-sm text-muted-foreground">{driver.assignment}</span>
                  ) : (
                    <span className="text-sm font-semibold text-primary">{driver.assignment}</span>
                  )}
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
      </div>
    </DashboardLayout>
  );
}
