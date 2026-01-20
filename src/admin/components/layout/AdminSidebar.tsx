import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  Shield,
  Bell,
  BarChart3,
  Settings,
  Menu,
  Package,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ProfileDropdown } from "../profile/ProfileDropdown";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Establecimientos", url: "/admin/establishments", icon: Building2 },
  { title: "Clientes", url: "/admin/clients", icon: Users },
  { title: "Staff", url: "/admin/staff", icon: UserCog },
  { title: "Citas", url: "/admin/appointments", icon: Calendar },
  { title: "Productos", url: "/admin/products", icon: Package },
];

const systemItems = [
  { title: "Moderación", url: "/admin/moderation", icon: Shield },
  { title: "Notificaciones", url: "/admin/notifications", icon: Bell },
  { title: "Analytics", url: "/admin/metrics", icon: BarChart3 },
  { title: "Configuración", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [systemOpen, setSystemOpen] = useState(true);
  const location = useLocation();

  const NavItem = ({ item, compact = false }: { item: typeof navItems[0]; compact?: boolean }) => {
    const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
    const Icon = item.icon;

    return (
      <NavLink
        to={item.url}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          "hover:bg-accent",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.title : undefined}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <div className="ml-2">
            <span className="font-semibold text-sm text-foreground">Mí Turnow</span>
            <span className="text-xs text-muted-foreground ml-1">Admin</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.url} item={item} />
          ))}
        </div>

        {/* System Section */}
        {!collapsed ? (
          <Collapsible open={systemOpen} onOpenChange={setSystemOpen} className="mt-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground">
              <span>Sistema</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", systemOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1">
              {systemItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="mt-4 pt-4 border-t border-sidebar-border space-y-0.5">
            {systemItems.map((item) => (
              <NavItem key={item.url} item={item} />
            ))}
          </div>
        )}
      </nav>

      {/* Footer with Profile Dropdown */}
      <div className="p-2 border-t border-sidebar-border">
        <ProfileDropdown collapsed={collapsed} />
      </div>
    </aside>
  );
}








