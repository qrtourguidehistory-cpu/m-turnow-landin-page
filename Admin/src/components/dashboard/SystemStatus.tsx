import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function SystemStatus() {
  const { data: stats, isLoading } = useDashboardStats();

  const services = [
    {
      name: "Database",
      status: "operational",
      latency: "12ms",
    },
    {
      name: "API",
      status: "operational",
      latency: "45ms",
    },
    {
      name: "Storage",
      status: "operational",
      latency: "89ms",
    },
    {
      name: "Auth",
      status: "operational",
      latency: "23ms",
    },
  ];

  const statusConfig = {
    operational: { icon: CheckCircle2, label: "Operativo", className: "text-success" },
    degraded: { icon: AlertCircle, label: "Degradado", className: "text-warning" },
    down: { icon: AlertCircle, label: "Caído", className: "text-destructive" },
  };

  return (
    <div className="card-elevated">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Estado del sistema</h3>
        <div className="flex items-center gap-1.5">
          <span className="status-dot status-active" />
          <span className="text-xs text-muted-foreground">Operativo</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {services.map((service) => {
          const config = statusConfig[service.status as keyof typeof statusConfig];
          const Icon = config.icon;

          return (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.className)} />
                <span className="text-sm text-foreground">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">{service.latency}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {isLoading ? "..." : stats?.totalBusinesses || 0}
            </p>
            <p className="text-xs text-muted-foreground">Negocios</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {isLoading ? "..." : stats?.totalClients || 0}
            </p>
            <p className="text-xs text-muted-foreground">Clientes</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {isLoading ? "..." : stats?.totalStaff || 0}
            </p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </div>
        </div>
      </div>
    </div>
  );
}
