import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useClients, useUpdateClient, Client } from "@/hooks/useClients";
import { ClientEditModal } from "@/components/clients/ClientEditModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MoreHorizontal, Eye, Ban, ShieldOff, Loader2, Pencil, Trash2, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  active: { label: "Activo", className: "bg-success/10 text-success" },
  blocked: { label: "Bloqueado", className: "bg-destructive/10 text-destructive" },
  inactive: { label: "Inactivo", className: "bg-muted text-muted-foreground" },
};

const Clients = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: clients, isLoading } = useClients({
    status: statusFilter as any,
    search: search || undefined,
  });
  
  const updateClient = useUpdateClient();
  
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const getStatus = (client: Client) => {
    if (client.is_blocked) return "blocked";
    if (!client.is_active) return "inactive";
    return "active";
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditModalOpen(true);
  };

  const handleBlock = async (id: string, name: string) => {
    try {
      await updateClient.mutateAsync({ id, updates: { is_blocked: true, blocked_at: new Date().toISOString() } });
      toast.success(`${name} ha sido bloqueado`);
    } catch {
      toast.error("Error al bloquear el cliente");
    }
  };

  const handleUnblock = async (id: string, name: string) => {
    try {
      await updateClient.mutateAsync({ id, updates: { is_blocked: false, blocked_at: null, blocked_reason: null } });
      toast.success(`${name} ha sido desbloqueado`);
    } catch {
      toast.error("Error al desbloquear el cliente");
    }
  };

  const handleSuspend = async (id: string, name: string) => {
    try {
      await updateClient.mutateAsync({ id, updates: { is_active: false } });
      toast.success(`${name} ha sido suspendido`);
    } catch {
      toast.error("Error al suspender el cliente");
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      await updateClient.mutateAsync({ id, updates: { is_active: true } });
      toast.success(`${name} ha sido activado`);
    } catch {
      toast.error("Error al activar el cliente");
    }
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);
      toast.success(`${clientToDelete.full_name || "Cliente"} eliminado correctamente`);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch {
      toast.error("Error al eliminar el cliente");
    }
  };

  const activeCount = clients?.filter(c => c.is_active && !c.is_blocked).length || 0;
  const blockedCount = clients?.filter(c => c.is_blocked).length || 0;
  const inactiveCount = clients?.filter(c => !c.is_active && !c.is_blocked).length || 0;

  return (
    <AdminLayout title="Clientes" description="Gestiona todos los usuarios registrados en la plataforma">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{clients?.length || 0}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Activos</span>
          <p className="text-2xl font-semibold text-success mt-1">{activeCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Bloqueados</span>
          <p className="text-2xl font-semibold text-destructive mt-1">{blockedCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Suspendidos</span>
          <p className="text-2xl font-semibold text-warning mt-1">{inactiveCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px]">Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Reservas</TableHead>
                <TableHead className="text-center">Total gastado</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : clients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                clients?.map((client) => {
                  const status = getStatus(client);
                  const config = statusConfig[status];
                  const initials = (client.full_name || client.first_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  
                  return (
                    <TableRow key={client.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{client.full_name || `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground truncate">{client.email || "Sin email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.phone || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", config.className)}>
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-foreground">
                        {client.total_bookings || 0}
                      </TableCell>
                      <TableCell className="text-center text-foreground">
                        ${(client.total_spent || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.created_at ? format(new Date(client.created_at), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Ver perfil</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!client.is_blocked ? (
                              <DropdownMenuItem onClick={() => handleBlock(client.id, client.full_name || "Cliente")} className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" /> Bloquear
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUnblock(client.id, client.full_name || "Cliente")}>
                                <ShieldOff className="h-4 w-4 mr-2" /> Desbloquear
                              </DropdownMenuItem>
                            )}
                            {client.is_active ? (
                              <DropdownMenuItem onClick={() => handleSuspend(client.id, client.full_name || "Cliente")} className="text-warning">
                                <UserX className="h-4 w-4 mr-2" /> Suspender
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(client.id, client.full_name || "Cliente")}>
                                <Eye className="h-4 w-4 mr-2" /> Activar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
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
        </ScrollArea>
      </div>

      {/* Edit Modal */}
      <ClientEditModal
        client={editingClient}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {clientToDelete?.full_name || "este cliente"} y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Clients;