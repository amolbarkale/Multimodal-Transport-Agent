import { Sidebar, useSidebarCollapse } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MoviChat } from "@/components/movi/MoviChat";
import { MoviFloatingButton } from "@/components/movi/MoviFloatingButton";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

function DashboardContent({ children, currentPage = "dashboard" }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarCollapse();
  const [moviOpen, setMoviOpen] = useState(false);
  
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
        currentPage={currentPage}
      />
    </>
  );
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <DashboardContent currentPage={currentPage}>{children}</DashboardContent>
    </div>
  );
}
