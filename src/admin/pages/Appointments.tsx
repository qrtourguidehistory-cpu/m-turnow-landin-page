import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useAppointments } from "../hooks/useAppointments";
import { useBusinesses } from "../hooks/useBusinesses";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Search, Loader2, Calendar, Clock, Building2, Smartphone, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmada", className: "bg-success/10 text-success" },
  pending: { label: "Pendiente", className: "bg-warning/10 text-warning" },
  completed: { label: "Completada", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelada", className: "bg-destructive/10 text-destructive" },
  no_show: { label: "No show", className: "bg-destructive/10 text-destructive" },
  started: { label: "En curso", className: "bg-info/10 text-info" },
};

const Appointments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  
  const { data: businesses } = useBusinesses();
  const { data: appointments, isLoading } = useAppointments({
    status: statusFilter,
    search: search || undefined,
    businessId: businessFilter !== "all" ? businessFilter : undefined,
  });

  const todayCount = appointments?.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 0;
  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;
  const cancelledCount = appointments?.filter(a => a.status === 'cancelled' || a.status === 'no_show').length || 0;

  return (
    <AdminLayout title="Citas" description="Gestión central de todas las citas del sistema">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{appointments?.length || 0}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Hoy</span>
          <p className="text-2xl font-semibold text-primary mt-1">{todayCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Completadas</span>
          <p className="text-2xl font-semibold text-success mt-1">{completedCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Canceladas/No show</span>
          <p className="text-2xl font-semibold text-destructive mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={businessFilter} onValueChange={setBusinessFilter}>
          <SelectTrigger className="w-[250px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Establecimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los establecimientos</SelectItem>
            {businesses?.map(biz => (
              <SelectItem key={biz.id} value={biz.id}>
                {biz.business_name || "Sin nombre"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No se encontraron citas
                  </TableCell>
                </TableRow>
              ) : (
                appointments?.map((apt) => {
                  const status = statusConfig[apt.status] || statusConfig.pending;
                  const isClientApp = apt.source === 'client_app' || apt.source === 'app';
                  
                  return (
                    <TableRow key={apt.id} className="table-row-hover">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{apt.client_name || "Sin nombre"}</p>
                          <p className="text-xs text-muted-foreground truncate">{apt.client_email || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">
                        {apt.business_name || "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {apt.service_name || "-"}
                      </TableCell>
                      <TableCell>
                        {apt.date && (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-foreground">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {apt.date}
                            </div>
                            {apt.start_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {apt.start_time}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {isClientApp ? (
                            <>
                              <Smartphone className="h-3 w-3" />
                              Cliente
                            </>
                          ) : (
                            <>
                              <Monitor className="h-3 w-3" />
                              Partner
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", status.className)}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {apt.price ? `$${apt.price.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </AdminLayout>
  );
};

export default Appointments;








