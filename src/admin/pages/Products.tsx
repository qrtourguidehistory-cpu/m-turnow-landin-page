import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useServices } from "../hooks/useServices";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Loader2, Clock, Building2 } from "lucide-react";
import { cn } from "../lib/utils";

const Products = () => {
  const [search, setSearch] = useState("");
  const { data: services, isLoading } = useServices({ search: search || undefined });

  const activeCount = services?.filter(s => s.is_active).length || 0;

  return (
    <AdminLayout title="Servicios & Productos" description="Catálogo de servicios de todos los establecimientos">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total servicios</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{services?.length || 0}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Activos</span>
          <p className="text-2xl font-semibold text-success mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px]">Servicio</TableHead>
              <TableHead>Negocio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Estado</TableHead>
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
            ) : services?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No se encontraron servicios
                </TableCell>
              </TableRow>
            ) : (
              services?.map((service) => (
                <TableRow key={service.id} className="table-row-hover">
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{service.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{service.business_name || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.category || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    ${service.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      service.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {service.is_active ? "Activo" : "Inactivo"}
                    </span>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Products;









