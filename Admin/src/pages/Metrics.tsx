import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  XCircle,
  UserCheck,
  UserX,
  Briefcase,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))"];

const Metrics = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  const metrics = [
    {
      category: "Negocios",
      items: [
        { label: "Total Negocios", value: stats?.totalBusinesses || 0, icon: Building2, color: "text-primary" },
        { label: "Activos", value: stats?.activeBusinesses || 0, icon: TrendingUp, color: "text-green-500" },
        { label: "Pendientes", value: stats?.pendingBusinesses || 0, icon: Clock, color: "text-yellow-500" },
        { label: "Suspendidos", value: stats?.suspendedBusinesses || 0, icon: TrendingDown, color: "text-destructive" },
      ]
    },
    {
      category: "Clientes",
      items: [
        { label: "Total Clientes", value: stats?.totalClients || 0, icon: Users, color: "text-primary" },
        { label: "Activos", value: stats?.activeClients || 0, icon: UserCheck, color: "text-green-500" },
        { label: "Bloqueados", value: stats?.blockedClients || 0, icon: UserX, color: "text-destructive" },
      ]
    },
    {
      category: "Citas",
      items: [
        { label: "Hoy", value: stats?.appointmentsToday || 0, icon: Calendar, color: "text-primary" },
        { label: "Esta Semana", value: stats?.appointmentsThisWeek || 0, icon: Calendar, color: "text-blue-500" },
        { label: "Este Mes", value: stats?.appointmentsThisMonth || 0, icon: Calendar, color: "text-indigo-500" },
        { label: "Canceladas", value: stats?.cancelledAppointments || 0, icon: XCircle, color: "text-orange-500" },
        { label: "No-Shows", value: stats?.noShowAppointments || 0, icon: UserX, color: "text-destructive" },
      ]
    },
    {
      category: "Staff",
      items: [
        { label: "Total Staff", value: stats?.totalStaff || 0, icon: Briefcase, color: "text-primary" },
      ]
    }
  ];

  // Calculate rates
  const businessActiveRate = stats?.totalBusinesses 
    ? Math.round((stats.activeBusinesses / stats.totalBusinesses) * 100) 
    : 0;
  
  const clientActiveRate = stats?.totalClients 
    ? Math.round((stats.activeClients / stats.totalClients) * 100) 
    : 0;

  const cancellationRate = stats?.appointmentsThisMonth 
    ? Math.round((stats.cancelledAppointments / stats.appointmentsThisMonth) * 100) 
    : 0;

  const noShowRate = stats?.appointmentsThisMonth 
    ? Math.round((stats.noShowAppointments / stats.appointmentsThisMonth) * 100) 
    : 0;

  if (statsLoading || chartsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-6 pr-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics del Sistema</h1>
            <p className="text-muted-foreground mt-1">KPIs, estadísticas y gráficos de la plataforma</p>
          </div>

          {/* Key Rates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">{businessActiveRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Negocios Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-500">{clientActiveRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Clientes Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-500">{cancellationRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Tasa Cancelación</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-destructive">{noShowRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Tasa No-Show</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendencia de Citas (últimos 7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts?.appointmentsByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        name="Citas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Businesses by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Negocios por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts?.businessesByCategory || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="category" type="category" width={100} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Negocios" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Estados de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts?.appointmentStatus || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(charts?.appointmentStatus || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparativa Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-foreground">{stats?.appointmentsThisMonth || 0}</p>
                    <p className="text-sm text-muted-foreground">Citas este mes</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-foreground">{stats?.appointmentsThisWeek || 0}</p>
                    <p className="text-sm text-muted-foreground">Citas esta semana</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-foreground">{stats?.totalClients || 0}</p>
                    <p className="text-sm text-muted-foreground">Total clientes</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-foreground">{stats?.totalStaff || 0}</p>
                    <p className="text-sm text-muted-foreground">Total staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          {metrics.map((section) => (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="text-lg">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className={`p-2 rounded-lg bg-background ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-semibold">{item.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Estado General</h4>
                  <p className="text-sm text-muted-foreground">
                    El sistema tiene {stats?.totalBusinesses || 0} negocios registrados, 
                    de los cuales {stats?.activeBusinesses || 0} están activos y operando.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Actividad de Citas</h4>
                  <p className="text-sm text-muted-foreground">
                    Hoy se tienen {stats?.appointmentsToday || 0} citas programadas. 
                    Este mes se han registrado {stats?.appointmentsThisMonth || 0} citas en total.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Atención Requerida</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingBusinesses || 0} negocios pendientes de aprobación. 
                    {stats?.blockedClients || 0} clientes bloqueados en el sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </AdminLayout>
  );
};

export default Metrics;