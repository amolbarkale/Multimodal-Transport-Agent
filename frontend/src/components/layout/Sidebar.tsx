import { Bus, MapIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState } from "react";

const menuItems = [
  { icon: Bus, label: "Bus Dashboard", path: "/dashboard/buses" },
  { icon: MapIcon, label: "Manage Routes", path: "/dashboard/routes" },
];

// Create context for sidebar state
const SidebarContext = createContext<{ isCollapsed: boolean }>({ isCollapsed: false });

export const useSidebarCollapse = () => useContext(SidebarContext);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border transition-smooth z-40",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">MoveInSync</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-muted rounded-md transition-fast"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-fast text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center"
            )}
            activeClassName="bg-primary/10 text-primary font-semibold border-l-4 border-primary"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@company.com</p>
            </div>
          </div>
        </div>
      )}
      </aside>
    </SidebarContext.Provider>
  );
}
