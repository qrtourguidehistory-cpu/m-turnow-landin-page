import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useStaff } from "../hooks/useStaff";
import { useBusinesses } from "../hooks/useBusinesses";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { Search, MoreHorizontal, Eye, Loader2, Building2, UserX, Ban, Trash2, Check, X } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Staff = () => {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  
  const queryClient = useQueryClient();
  
  const { data: businesses } = useBusinesses();
  const { data: staff, isLoading } = useStaff({ 
    search: search || undefined,
    businessId: businessFilter !== "all" ? businessFilter : undefined
  });

  const activeCount = staff?.filter(s => s.is_active).length || 0;

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("staff")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff actualizado correctamente");
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff eliminado correctamente");
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    },
  });

  const handleViewDetails = (member: any) => {
    setSelectedStaff(member);
    setDetailDialogOpen(true);
  };

  const handleSuspend = async (id: string, name: string) => {
    try {
      await updateStaffMutation.mutateAsync({ id, updates: { is_active: false } });
      toast.success(`${name} ha sido suspendido`);
    } catch {
      toast.error("Error al suspender el staff");
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      await updateStaffMutation.mutateAsync({ id, updates: { is_active: true } });
      toast.success(`${name} ha sido activado`);
    } catch {
      toast.error("Error al activar el staff");
    }
  };

  const handleDeleteClick = (member: any) => {
    setStaffToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaffMutation.mutateAsync(staffToDelete.id);
    } catch {
      toast.error("Error al eliminar el staff");
    }
  };

  return (
    <AdminLayout title="Staff" description="Personal de todos los establecimientos">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total staff</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{staff?.length || 0}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Activos</span>
          <p className="text-2xl font-semibold text-success mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={businessFilter} onValueChange={setBusinessFilter}>
          <SelectTrigger className="w-[250px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por establecimiento" />
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
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Empleado</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : staff?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No se encontró staff
                  </TableCell>
                </TableRow>
              ) : (
                staff?.map((member) => {
                  const initials = (member.full_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  
                  return (
                    <TableRow key={member.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{member.full_name || "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email || member.phone || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">{member.business_name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.specialties?.join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                          member.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        )}>
                          {member.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.created_at ? format(new Date(member.created_at), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                              <Eye className="h-4 w-4 mr-2" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.is_active ? (
                              <DropdownMenuItem onClick={() => handleSuspend(member.id, member.full_name || "Staff")} className="text-warning">
                                <UserX className="h-4 w-4 mr-2" /> Suspender
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(member.id, member.full_name || "Staff")}>
                                <Check className="h-4 w-4 mr-2" /> Activar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteClick(member)} className="text-destructive">
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

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Staff</DialogTitle>
            <DialogDescription>
              Información completa del miembro del equipo
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {(selectedStaff.full_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedStaff.full_name || "Sin nombre"}</p>
                  <p className="text-sm text-muted-foreground">{selectedStaff.business_name || "-"}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedStaff.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{selectedStaff.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especialidades</p>
                  <p className="text-sm">{selectedStaff.specialties?.join(", ") || "-"}</p>
                </div>
                {selectedStaff.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Biografía</p>
                    <p className="text-sm">{selectedStaff.bio}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                    selectedStaff.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {selectedStaff.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {selectedStaff.created_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registrado</p>
                    <p className="text-sm">{format(new Date(selectedStaff.created_at), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar staff?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {staffToDelete?.full_name || "este miembro del staff"} y todos sus datos asociados. Esta acción no se puede deshacer.
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

export default Staff;








