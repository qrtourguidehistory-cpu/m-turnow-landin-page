import { cn } from "@/lib/utils";
import { useRecentAppointments } from "@/hooks/useRecentAppointments";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Loader2 } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmada", className: "bg-success/10 text-success" },
  pending: { label: "Pendiente", className: "bg-warning/10 text-warning" },
  completed: { label: "Completada", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelada", className: "bg-destructive/10 text-destructive" },
  no_show: { label: "No show", className: "bg-destructive/10 text-destructive" },
  started: { label: "En curso", className: "bg-info/10 text-info" },
};

export function RecentAppointments() {
  const { data: appointments, isLoading, error } = useRecentAppointments(8);

  if (isLoading) {
    return (
      <div className="card-elevated p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Citas recientes</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Citas recientes</h3>
        <p className="text-sm text-destructive">Error al cargar las citas</p>
      </div>
    );
  }

  return (
    <div className="card-elevated">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Citas recientes</h3>
      </div>
      
      <div className="divide-y divide-border">
        {appointments?.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay citas recientes</p>
          </div>
        ) : (
          appointments?.map((apt) => {
            const status = statusConfig[apt.status] || statusConfig.pending;
            
            return (
              <div key={apt.id} className="p-4 table-row-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {apt.client_name || "Cliente sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {apt.business_name || "Negocio desconocido"}
                    </p>
                    {apt.date && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {apt.date}
                        </span>
                        {apt.start_time && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {apt.start_time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0",
                    status.className
                  )}>
                    {status.label}
                  </span>
                </div>
                {apt.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Creada {formatDistanceToNow(new Date(apt.created_at), { addSuffix: true, locale: es })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
