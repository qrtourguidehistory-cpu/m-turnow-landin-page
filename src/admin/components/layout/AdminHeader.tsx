import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, Users, AlertTriangle, CheckCircle, Clock, Trash2, RefreshCw, FileText } from "lucide-react";
import { cn } from "../../lib/utils";

export function AdminHeader() {
  const navigate = useNavigate();
  const { data: notifications } = useAdminNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Calcular total de alertas
  const pendingApprovals = (notifications?.pendingBusinesses?.length || 0) + (notifications?.approvalRequests?.length || 0);
  const suspendedBusinesses = notifications?.suspendedBusinesses?.length || 0;
  const blockedClients = notifications?.blockedClients?.length || 0;
  const lowRatings = notifications?.lowRatingReviews?.length || 0;
  const deletedAccounts = notifications?.deletedAccounts?.length || 0;
  const profileChanges = notifications?.profileChanges?.length || 0;

  const totalAlerts = pendingApprovals + suspendedBusinesses + blockedClients + lowRatings + deletedAccounts + profileChanges;

  const handleNotificationClick = (type: string) => {
    setIsOpen(false);
    navigate(`/admin/notifications`);
  };

  return (
    <header className="h-14 border-b border-sidebar-border bg-sidebar flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-foreground">Mí Turnow</span>
        <span className="text-xs text-muted-foreground">Admin</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalAlerts > 99 ? "99+" : totalAlerts}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notificaciones</h3>
                {totalAlerts > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {totalAlerts} nueva{totalAlerts !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-1">
                {/* Pending Approvals */}
                {pendingApprovals > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleNotificationClick("approvals")}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="font-medium text-sm">Solicitudes de Aprobación</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {pendingApprovals}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {pendingApprovals} establecimiento{pendingApprovals !== 1 ? 's' : ''} pendiente{pendingApprovals !== 1 ? 's' : ''}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Profile Changes */}
                {profileChanges > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleNotificationClick("profile-changes")}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Cambios de Perfil</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {profileChanges}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {profileChanges} perfil{profileChanges !== 1 ? 'es' : ''} modificado{profileChanges !== 1 ? 's' : ''} - requiere re-aprobación
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Deleted Accounts */}
                {deletedAccounts > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleNotificationClick("deleted")}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">Cuentas Eliminadas</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {deletedAccounts}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {deletedAccounts} cuenta{deletedAccounts !== 1 ? 's' : ''} eliminada{deletedAccounts !== 1 ? 's' : ''} recientemente
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Blocked Clients */}
                {blockedClients > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleNotificationClick("blocked")}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">Clientes Bloqueados</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {blockedClients}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {blockedClients} cliente{blockedClients !== 1 ? 's' : ''} bloqueado{blockedClients !== 1 ? 's' : ''}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Suspended Businesses */}
                {suspendedBusinesses > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleNotificationClick("suspended")}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Building2 className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">Negocios Suspendidos</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {suspendedBusinesses}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {suspendedBusinesses} negocio{suspendedBusinesses !== 1 ? 's' : ''} suspendido{suspendedBusinesses !== 1 ? 's' : ''}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {totalAlerts === 0 && (
                  <div className="p-8 text-center">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">No hay notificaciones</p>
                    <p className="text-xs text-muted-foreground mt-1">Todo está al día</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {totalAlerts > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/admin/notifications");
                    }}
                  >
                    Ver todas las notificaciones
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

