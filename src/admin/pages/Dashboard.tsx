import { AdminLayout } from "../components/layout/AdminLayout";
import { MetricCard } from "../components/dashboard/MetricCard";
import { NewClients } from "../components/dashboard/NewClients";
import { PendingApprovals } from "../components/dashboard/PendingApprovals";
import { SystemStatus } from "../components/dashboard/SystemStatus";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardCharts } from "../hooks/useDashboardCharts";
import { useBusinesses, usePendingBusinesses, usePendingApprovalRequests } from "../hooks/useBusinesses";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  Building2, 
  Users, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  UserX,
  Check,
  Eye,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUpdateBusiness, useUpdateApprovalRequest } from "../hooks/useBusinesses";
import { EstablishmentDetailSheet } from "../components/establishments/EstablishmentDetailSheet";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: chartData } = useDashboardCharts();
  const { data: pendingApprovalRequests } = usePendingApprovalRequests();
  const updateBusiness = useUpdateBusiness();
  const updateApprovalRequest = useUpdateApprovalRequest();
  
  const [showAllPending, setShowAllPending] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // SOLO mostrar establecimientos con solicitudes de aprobación pendientes
  // No mostrar todos los que tienen approval_status pending/draft
  const pendingBusinesses = (pendingApprovalRequests || [])
    .filter(req => req.business) // Solo los que tienen business asociado
    .map(req => ({ 
      ...req.business, 
      requestId: req.id, 
      requestNotes: req.notes,
      submittedAt: req.submitted_at,
      isFromRequest: true 
    }));

  const handleApprove = async (biz: any) => {
    try {
      if (!biz.requestId) {
        toast.error("No se puede aprobar: falta información de la solicitud");
        return;
      }

      // Usar updateApprovalRequest que maneja todo correctamente
      await updateApprovalRequest.mutateAsync({
        requestId: biz.requestId,
        businessId: biz.id,
        status: "approved"
      });
      
      toast.success(`${biz.business_name || "Negocio"} ha sido aprobado y publicado`);
    } catch (err: any) {
      console.error("Error approving:", err);
      const errorMessage = err?.message || "Error al aprobar el establecimiento";
      // Si el error es por RLS de business_subscriptions, informar pero continuar
      if (errorMessage.includes("business_subscriptions") || errorMessage.includes("row-level security")) {
        toast.warning("El negocio fue aprobado, pero hubo un problema con la suscripción. Revisa manualmente.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleReject = async (biz: any) => {
    try {
      if (!biz.requestId) {
        toast.error("No se puede rechazar: falta información de la solicitud");
        return;
      }

      await updateApprovalRequest.mutateAsync({
        requestId: biz.requestId,
        businessId: biz.id,
        status: "rejected",
        rejectionReason: "Solicitud rechazada por el administrador"
      });
      
      toast.success(`${biz.business_name || "Negocio"} ha sido rechazado`);
    } catch (err: any) {
      console.error("Error rejecting:", err);
      toast.error(err?.message || "Error al rechazar el establecimiento");
    }
  };

  const handleViewDetails = (biz: any) => {
    setSelectedBusiness(biz);
    setDetailsOpen(true);
  };

  // Prepare line chart data - now chartData.appointmentsByDay is already an array
  const lineChartData = chartData?.appointmentsByDay?.map((item: any) => ({
    name: item.date,
    citas: item.count,
  })) || [];

  return (
    <AdminLayout title="Dashboard" description="Vista general del sistema Mí Turnow">
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-6 pr-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Negocios activos"
              value={stats?.activeBusinesses || 0}
              change={12}
              changeLabel="vs mes anterior"
              icon={<Building2 className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Clientes registrados"
              value={stats?.totalClients || 0}
              change={8}
              changeLabel="vs mes anterior"
              icon={<Users className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Citas este mes"
              value={stats?.appointmentsThisMonth || 0}
              change={-3}
              changeLabel="vs mes anterior"
              icon={<Calendar className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Tasa no-show"
              value={stats ? `${((stats.noShowAppointments / (stats.appointmentsThisMonth || 1)) * 100).toFixed(1)}%` : "0%"}
              change={-15}
              changeLabel="vs mes anterior"
              icon={<UserX className="h-4 w-4" />}
              loading={isLoading}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Appointments by Day */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Citas (Últimos 7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="citas"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Estado de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData?.appointmentStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(chartData?.appointmentStatus || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart - Businesses by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Negocios por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData?.businessesByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Negocios" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending Approvals Section */}
          {pendingBusinesses && pendingBusinesses.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-lg font-semibold">
                    Establecimientos Pendientes de Aprobación ({pendingBusinesses.length})
                  </CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="flex items-center gap-2"
                >
                  {showAllPending ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Ver todos
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(showAllPending ? pendingBusinesses : pendingBusinesses.slice(0, 5)).map((biz: any) => (
                    <div key={biz?.id || biz?.business_id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{biz?.business_name || biz?.name || "Sin nombre"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {biz?.created_at || biz?.submitted_at
                                ? format(new Date(biz.created_at || biz.submitted_at), "dd MMM yyyy", { locale: es })
                                : "-"}
                            </span>
                            {(biz?.primary_category || biz?.category) && (
                              <>
                                <span>•</span>
                                <span className="truncate">{biz.primary_category || biz.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleViewDetails(biz)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleApprove(biz)}
                          disabled={updateBusiness.isPending || updateApprovalRequest.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(biz)}
                          disabled={updateBusiness.isPending || updateApprovalRequest.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Rates (from Analytics) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">
                    {stats?.totalBusinesses 
                      ? Math.round((stats.activeBusinesses / stats.totalBusinesses) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Negocios Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-500">
                    {stats?.totalClients 
                      ? Math.round((stats.activeClients / stats.totalClients) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Clientes Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-500">
                    {stats?.appointmentsThisMonth 
                      ? Math.round((stats.cancelledAppointments / stats.appointmentsThisMonth) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Tasa Cancelación</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-destructive">
                    {stats?.appointmentsThisMonth 
                      ? Math.round((stats.noShowAppointments / stats.appointmentsThisMonth) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Tasa No-Show</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pendientes de aprobar"
              value={stats?.pendingBusinesses || 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Negocios suspendidos"
              value={stats?.suspendedBusinesses || 0}
              icon={<Building2 className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Clientes bloqueados"
              value={stats?.blockedClients || 0}
              icon={<UserX className="h-4 w-4" />}
              loading={isLoading}
            />
            <MetricCard
              title="Citas hoy"
              value={stats?.appointmentsToday || 0}
              icon={<TrendingUp className="h-4 w-4" />}
              loading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <NewClients />
            </div>
            <div className="space-y-6">
              <PendingApprovals />
              <SystemStatus />
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Establishment Detail Sheet */}
      {selectedBusiness && (
        <EstablishmentDetailSheet
          business={selectedBusiness}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onApprove={(id, name) => handleApprove(selectedBusiness)}
          onSuspend={(id, name) => {
            // Handle suspend if needed
            toast.info("Usa la sección de Establecimientos para suspender");
          }}
          onActivate={(id, name) => {
            // Handle activate if needed
            handleApprove(selectedBusiness);
          }}
          isActionPending={updateBusiness.isPending || updateApprovalRequest.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default Dashboard;









