import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useSubscriptions, useUpdateSubscription, BusinessSubscription } from "../hooks/useSubscriptions";
import { Button } from "../components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Search, MoreHorizontal, Loader2, Building2, CreditCard, Check, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { ManualActivationDialog } from "../components/subscriptions/ManualActivationDialog";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { supabase } from "../integrations/supabase/client";

const statusConfig = {
  active: { label: "Al día", className: "bg-success/10 text-success", icon: Check },
  past_due: { label: "Atrasado", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  inactive: { label: "Inactivo", className: "bg-muted text-muted-foreground", icon: Calendar },
  cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground", icon: Calendar },
  suspended: { label: "Suspendido", className: "bg-warning/10 text-warning", icon: AlertTriangle },
};

const Subscriptions = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<BusinessSubscription | null>(null);
  const [manualActivateDialogOpen, setManualActivateDialogOpen] = useState(false);

  const { data: subscriptions, isLoading } = useSubscriptions({
    status: statusFilter,
    search: search || undefined,
  });

  const updateSubscription = useUpdateSubscription();

  const activeCount = subscriptions?.filter(s => s.status === "active").length || 0;
  const pastDueCount = subscriptions?.filter(s => s.status === "past_due").length || 0;
  const totalDue = subscriptions?.reduce((sum, s) => sum + (s.amount_due || 0), 0) || 0;

  const handleManualActivate = async (periodEnd: Date, activationNote: string) => {
    if (!selectedSubscription) return;

    try {
      await updateSubscription.mutateAsync({
        id: selectedSubscription.id,
        updates: {
          status: "active",
          manually_activated: true,
          activation_note: activationNote || null,
          current_period_end: periodEnd.toISOString(),
          next_payment_date: periodEnd.toISOString(),
          payment_due_date: periodEnd.toISOString(),
          amount_due: 0,
          days_overdue: 0,
        },
      });

      // Also update the business to be public and active
      const { error: businessError } = await supabase
        .from("businesses")
        .update({ is_public: true, is_active: true })
        .eq("id", selectedSubscription.business_id);

      if (businessError) {
        console.error("Error updating business:", businessError);
        // Don't throw - subscription was updated successfully
      }

      toast.success(`Suscripción activada manualmente hasta ${format(periodEnd, "dd/MM/yyyy")}`);
      setManualActivateDialogOpen(false);
      setSelectedSubscription(null);
    } catch (err: any) {
      toast.error(err.message || "Error al activar la suscripción");
    }
  };

  const handleSuspend = async (subscription: BusinessSubscription) => {
    try {
      await updateSubscription.mutateAsync({
        id: subscription.id,
        updates: { status: "suspended" },
      });
      
      // También actualizar el negocio para que no sea público
      const { error: businessError } = await supabase
        .from("businesses")
        .update({ is_public: false, is_active: false })
        .eq("id", subscription.business_id);

      if (businessError) {
        console.error("Error updating business:", businessError);
      }

      toast.success("Suscripción suspendida");
    } catch (err: any) {
      toast.error("Error al suspender la suscripción");
    }
  };

  const handleReactivate = async (subscription: BusinessSubscription) => {
    try {
      await updateSubscription.mutateAsync({
        id: subscription.id,
        updates: { status: "active" },
      });
      
      // También actualizar el negocio para que sea público y activo
      const { error: businessError } = await supabase
        .from("businesses")
        .update({ is_public: true, is_active: true })
        .eq("id", subscription.business_id);

      if (businessError) {
        console.error("Error updating business:", businessError);
      }

      toast.success("Suscripción reactivada");
    } catch (err: any) {
      toast.error("Error al reactivar la suscripción");
    }
  };

  const handleCancelSubscription = async (subscription: BusinessSubscription) => {
    if (!confirm(`¿Estás seguro de cancelar la suscripción de ${subscription.business_name || "este negocio"}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await updateSubscription.mutateAsync({
        id: subscription.id,
        updates: { status: "cancelled" },
      });
      
      // También actualizar el negocio para que no sea público
      const { error: businessError } = await supabase
        .from("businesses")
        .update({ is_public: false, is_active: false })
        .eq("id", subscription.business_id);

      if (businessError) {
        console.error("Error updating business:", businessError);
      }

      toast.success("Suscripción cancelada");
    } catch (err: any) {
      toast.error("Error al cancelar la suscripción");
    }
  };

  return (
    <AdminLayout title="Suscripciones" description="Administra las suscripciones mensuales de los establecimientos">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total suscripciones</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{subscriptions?.length || 0}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Al día</span>
          <p className="text-2xl font-semibold text-success mt-1">{activeCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Atrasadas</span>
          <p className="text-2xl font-semibold text-destructive mt-1">{pastDueCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total adeudado</span>
          <p className="text-2xl font-semibold text-warning mt-1">${totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de negocio o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Al día</SelectItem>
            <SelectItem value="past_due">Atrasados</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Negocio</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Monto mensual</TableHead>
              <TableHead className="text-right">Adeudado</TableHead>
              <TableHead>Próximo pago</TableHead>
              <TableHead>Días atrasado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : subscriptions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No se encontraron suscripciones
                </TableCell>
              </TableRow>
            ) : (
              subscriptions?.map((subscription) => {
                const status = statusConfig[subscription.status] || statusConfig.inactive;
                const StatusIcon = status.icon;
                const isOverdue = subscription.status === "past_due" || subscription.days_overdue > 0;

                return (
                  <TableRow key={subscription.id} className={cn("table-row-hover", isOverdue && "bg-destructive/5")}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{subscription.business_name || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.owner_email || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(status.className, "flex items-center gap-1 w-fit")}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.subscription_plan}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${subscription.monthly_fee?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      subscription.amount_due > 0 ? "text-destructive" : "text-foreground"
                    )}>
                      ${(subscription.amount_due || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.next_payment_date
                        ? format(new Date(subscription.next_payment_date), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {subscription.days_overdue > 0 ? (
                        <span className="text-destructive font-medium">{subscription.days_overdue} días</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setManualActivateDialogOpen(true);
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" /> Activar manualmente
                          </DropdownMenuItem>
                          {subscription.status === "suspended" && (
                            <DropdownMenuItem 
                              onClick={() => handleReactivate(subscription)} 
                              className="text-success"
                            >
                              <Check className="h-4 w-4 mr-2" /> Reactivar
                            </DropdownMenuItem>
                          )}
                          {subscription.status !== "suspended" && (
                            <DropdownMenuItem onClick={() => handleSuspend(subscription)} className="text-warning">
                              <AlertTriangle className="h-4 w-4 mr-2" /> Suspender
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleCancelSubscription(subscription)} 
                            className="text-destructive"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" /> Cancelar suscripción
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Manual Activation Dialog */}
      <ManualActivationDialog
        open={manualActivateDialogOpen}
        onOpenChange={setManualActivateDialogOpen}
        subscription={selectedSubscription}
        onActivate={handleManualActivate}
        isPending={updateSubscription.isPending}
      />
    </AdminLayout>
  );
};

export default Subscriptions;

