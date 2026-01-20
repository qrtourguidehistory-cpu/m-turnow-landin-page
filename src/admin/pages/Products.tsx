import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useAllProducts } from "../hooks/useBusinessProducts";
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
import { Search, MoreHorizontal, Eye, Loader2, Package, Building2 } from "lucide-react";
import { cn } from "../lib/utils";

const Products = () => {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useAllProducts({ search: search || undefined });

  const activeCount = products?.filter(p => p.is_active).length || 0;

  return (
    <AdminLayout title="Productos" description="Catálogo de productos de venta de todos los establecimientos">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Total productos</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{products?.length || 0}</p>
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
          placeholder="Buscar producto..."
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
              <TableHead className="w-[250px]">Producto</TableHead>
              <TableHead>Negocio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio Unitario</TableHead>
              <TableHead className="text-center">Stock</TableHead>
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
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <TableRow key={product.id} className="table-row-hover">
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{product.business_name || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category || "-"}
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    ${(product.unit_price || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{product.current_stock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      product.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {product.is_active ? "Activo" : "Inactivo"}
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









