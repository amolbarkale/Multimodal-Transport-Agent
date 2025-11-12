import { Search, Bell, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

export function TopNav() {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace("-", " "),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-card border-b border-border z-30 px-6">
      <div className="flex items-center justify-between h-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-fast">
            Home
          </span>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span
                className={
                  crumb.isLast
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground cursor-pointer transition-fast"
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search... (⌘K)"
              className="pl-9 w-64 bg-muted/50 border-border"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded-lg transition-fast">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer hover:bg-muted px-3 py-1.5 rounded-lg transition-fast">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
              JD
            </div>
            <span className="text-sm font-medium text-foreground">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
}
