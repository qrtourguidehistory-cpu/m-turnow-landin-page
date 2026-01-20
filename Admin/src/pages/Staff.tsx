import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useStaff } from "@/hooks/useStaff";
import { useBusinesses } from "@/hooks/useBusinesses";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MoreHorizontal, Eye, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Staff = () => {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  
  const { data: businesses } = useBusinesses();
  const { data: staff, isLoading } = useStaff({ 
    search: search || undefined,
    businessId: businessFilter !== "all" ? businessFilter : undefined
  });

  const activeCount = staff?.filter(s => s.is_active).length || 0;

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
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Ver detalles</DropdownMenuItem>
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
    </AdminLayout>
  );
};

export default Staff;