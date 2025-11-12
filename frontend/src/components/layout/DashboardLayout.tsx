import { Sidebar, useSidebarCollapse } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MoviAssistant } from "@/components/MoviAssistant";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarCollapse();
  
  return (
    <>
      <TopNav />
      <main className={cn(
        "mt-16 p-6 transition-smooth",
        isCollapsed ? "ml-16" : "ml-60"
      )}>
        {children}
      </main>
      <MoviAssistant />
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
