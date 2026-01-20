import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useAdminNotifications } from "../hooks/useAdminNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Bell, 
  Search, 
  Building2, 
  Users, 
  Star, 
  UserPlus, 
  Clock,
  Ban,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Image
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: notifications, isLoading } = useAdminNotifications();

  const stats = {
    pendingApprovals: notifications?.pendingBusinesses?.length || 0,
    suspendedBusinesses: notifications?.suspendedBusinesses?.length || 0,
    blockedClients: notifications?.blockedClients?.length || 0,
    lowRatings: notifications?.lowRatingReviews?.length || 0,
    newClients: notifications?.newClients?.length || 0,
    newBusinesses: notifications?.newBusinesses?.length || 0,
    newStaff: notifications?.newStaff?.length || 0,
  };

  const totalAlerts = stats.pendingApprovals + stats.suspendedBusinesses + stats.blockedClients + stats.lowRatings;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Centro de Notificaciones</h1>
            <p className="text-muted-foreground mt-1">Monitoreo de actividad y alertas del sistema</p>
          </div>
          <Badge variant={totalAlerts > 0 ? "destructive" : "secondary"} className="text-sm px-3 py-1">
            {totalAlerts} alertas activas
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.pendingApprovals}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Suspendidos</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.suspendedBusinesses}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Bloqueados</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.blockedClients}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Reseñas bajas</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.lowRatings}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Nuevos clientes</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.newClients}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Nuevos negocios</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.newBusinesses}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Nuevo staff</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.newStaff}</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Bell className="h-4 w-4 mr-2" />
              Actividad reciente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {/* Pending Approvals */}
            {notifications?.pendingBusinesses && notifications.pendingBusinesses.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Negocios Pendientes de Aprobación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.pendingBusinesses.map((biz: any) => (
                        <div key={biz.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-warning" />
                            <div>
                              <p className="font-medium">{biz.business_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{biz.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {biz.created_at && formatDistanceToNow(new Date(biz.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Blocked Clients */}
            {notifications?.blockedClients && notifications.blockedClients.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ban className="h-5 w-5 text-destructive" />
                    Clientes Bloqueados Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.blockedClients.map((client: any) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium">{client.full_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{client.blocked_reason || "Sin razón especificada"}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {client.blocked_at && formatDistanceToNow(new Date(client.blocked_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Low Rating Reviews */}
            {notifications?.lowRatingReviews && notifications.lowRatingReviews.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />
                    Reseñas Bajas (menos de 3 estrellas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.lowRatingReviews.map((review: any) => (
                        <div key={review.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                          <div className="flex items-center gap-3">
                            <Badge variant="destructive">⭐ {review.rating}</Badge>
                            <div>
                              <p className="font-medium text-sm">{review.business_name || "Negocio"}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{review.comment || "Sin comentario"}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {totalAlerts === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-lg font-medium">No hay alertas activas</p>
                <p className="text-sm text-muted-foreground">Todo está funcionando correctamente</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {/* New Clients */}
            {notifications?.newClients && notifications.newClients.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-success" />
                    Nuevos Clientes (últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.newClients.map((client: any) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-success" />
                            <div>
                              <p className="font-medium">{client.full_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{client.email || client.phone}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {client.created_at && formatDistanceToNow(new Date(client.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* New Businesses */}
            {notifications?.newBusinesses && notifications.newBusinesses.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Nuevos Establecimientos (últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.newBusinesses.map((biz: any) => (
                        <div key={biz.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{biz.business_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{biz.primary_category || "General"}</p>
                            </div>
                          </div>
                          <Badge variant={biz.approval_status === "approved" ? "default" : "secondary"}>
                            {biz.approval_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* New Staff */}
            {notifications?.newStaff && notifications.newStaff.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Nuevo Staff (últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notifications.newStaff.map((staff: any) => (
                        <div key={staff.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{staff.full_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground">{staff.business_name || "Negocio"}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {staff.created_at && formatDistanceToNow(new Date(staff.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Notifications;








