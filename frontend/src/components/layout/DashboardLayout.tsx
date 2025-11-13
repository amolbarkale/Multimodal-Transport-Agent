import { Sidebar, useSidebarCollapse } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MoviChat } from "@/components/movi/MoviChat";
import { MoviFloatingButton } from "@/components/movi/MoviFloatingButton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocation } from "react-router-dom"; // <-- Import useLocation

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Helper function to get a clean page name from the URL
const getPageNameFromPath = (pathname: string): string => {
  const lastSegment = pathname.split('/').pop() || 'dashboard';
  // Example: 'bus-dashboard' -> 'busDashboard'
  return lastSegment.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarCollapse();
  const [moviOpen, setMoviOpen] = useState(false);
  
  // Get the current location from the router
  const location = useLocation();
  const currentPage = getPageNameFromPath(location.pathname);

  return (
    <>
      <TopNav />
      <main className={cn(
        "mt-16 p-6 transition-smooth",
        isCollapsed ? "ml-16" : "ml-60"
      )}>
        {children}
      </main>
      {/* Movi AI Assistant */}
      <MoviFloatingButton onClick={() => setMoviOpen(!moviOpen)} />
      <MoviChat
        isOpen={moviOpen}
        onClose={() => setMoviOpen(false)}
        currentPage={currentPage} // <-- Pass the dynamic page name
      />
    </>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <DashboardContent>{children}</DashboardContent>
    </div>
  );
}