import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useBusinesses, useUpdateBusiness, Business } from "../hooks/useBusinesses";
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
import { EstablishmentDetailSheet } from "../components/establishments/EstablishmentDetailSheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Search, MoreHorizontal, Eye, Check, Ban, Loader2, Building2, Star, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig = {
  active: { label: "Activo", className: "bg-success/10 text-success" },
  pending: { label: "Pendiente", className: "bg-warning/10 text-warning" },
  suspended: { label: "Suspendido", className: "bg-destructive/10 text-destructive" },
};

const COUNTRIES = [
  { value: "all", label: "Todos los países" },
  { value: "DO", label: "🇩🇴 República Dominicana" },
  { value: "US", label: "🇺🇸 Estados Unidos" },
  { value: "MX", label: "🇲🇽 México" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "PR", label: "🇵🇷 Puerto Rico" },
  { value: "ES", label: "🇪🇸 España" },
  { value: "CA", label: "🇨🇦 Canadá" },
  { value: "VE", label: "🇻🇪 Venezuela" },
  { value: "CR", label: "🇨🇷 Costa Rica" },
  { value: "PA", label: "🇵🇦 Panamá" },
];

const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  { value: "barberia", label: "Barbería" },
  { value: "salon", label: "Salón de Belleza" },
  { value: "spa", label: "Spa" },
  { value: "clinica", label: "Clínica" },
  { value: "gimnasio", label: "Gimnasio" },
  { value: "consultorio", label: "Consultorio" },
  { value: "general", label: "General" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
  { value: "rating", label: "Mejor rating" },
];

const Establishments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const { data: businesses, isLoading, refetch } = useBusinesses({
    status: statusFilter as any,
    search: search || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });
  
  const updateBusiness = useUpdateBusiness();

  const getStatus = (biz: Business) => {
    if (!biz.is_active) return "suspended";
    if (biz.approval_status === "pending") return "pending";
    if (biz.approval_status === "approved") return "active";
    return "pending";
  };

  const handleViewDetails = (biz: Business) => {
    setSelectedBusiness(biz);
    setDetailsOpen(true);
  };

  const handleAction = async (id: string, action: string, name: string) => {
    try {
      if (action === "approve") {
        await updateBusiness.mutateAsync({ 
          id, 
          updates: { 
            approval_status: "approved",
            onboarding_completed: true, 
            is_active: true, 
            is_public: true 
          } 
        });
        toast.success(`${name} aprobado y publicado`);
      } else if (action === "suspend") {
        await updateBusiness.mutateAsync({ 
          id, 
          updates: { 
            is_active: false, 
            is_public: false
          } 
        });
        toast.success(`${name} suspendido`);
      } else if (action === "activate") {
        await updateBusiness.mutateAsync({ 
          id, 
          updates: { 
            is_active: true, 
            is_public: true,
            approval_status: "approved"
          } 
        });
        toast.success(`${name} activado`);
      }
      refetch();
    } catch (error: any) {
      toast.error(`Error: ${error?.message || "No se pudo realizar la acción."}`);
    }
  };

  // Sort and filter businesses
  const sortedBusinesses = [...(businesses || [])].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return (a.business_name || "").localeCompare(b.business_name || "");
      case "name_desc":
        return (b.business_name || "").localeCompare(a.business_name || "");
      case "rating":
        return (b.average_rating || 0) - (a.average_rating || 0);
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const allBusinesses = businesses || [];
  const activeCount = allBusinesses.filter(b => b.is_active && b.approval_status === "approved").length;
  const pendingCount = allBusinesses.filter(b => b.approval_status === "pending").length;
  const suspendedCount = allBusinesses.filter(b => !b.is_active).length;

  return (
    <AdminLayout title="Establecimientos" description="Gestiona todos los negocios de la plataforma">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Activos</span>
          <p className="text-2xl font-semibold text-foreground mt-1">{activeCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Pendientes</span>
          <p className="text-2xl font-semibold text-warning mt-1">{pendingCount}</p>
        </div>
        <div className="metric-card">
          <span className="text-sm text-muted-foreground">Suspendidos</span>
          <p className="text-2xl font-semibold text-destructive mt-1">{suspendedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="suspended">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Negocio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rating</TableHead>
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
              ) : sortedBusinesses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No se encontraron establecimientos
                  </TableCell>
                </TableRow>
              ) : (
                sortedBusinesses?.map((biz) => {
                  const status = getStatus(biz);
                  const config = statusConfig[status];
                  
                  return (
                    <TableRow key={biz.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{biz.business_name || "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground truncate">{biz.email || "Sin email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {biz.primary_category || biz.category || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", config.className)}>
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {biz.average_rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            <span className="text-foreground">{biz.average_rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({biz.total_reviews || 0})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {biz.created_at ? format(new Date(biz.created_at), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(biz)}>
                              <Eye className="h-4 w-4 mr-2" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status === "pending" && (
                              <DropdownMenuItem onClick={() => handleAction(biz.id, "approve", biz.business_name || "")}>
                                <Check className="h-4 w-4 mr-2 text-success" /> Aprobar
                              </DropdownMenuItem>
                            )}
                            {status === "active" && (
                              <DropdownMenuItem onClick={() => handleAction(biz.id, "suspend", biz.business_name || "")} className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" /> Suspender
                              </DropdownMenuItem>
                            )}
                            {status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleAction(biz.id, "activate", biz.business_name || "")}>
                                <Check className="h-4 w-4 mr-2 text-success" /> Reactivar
                              </DropdownMenuItem>
                            )}
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

      {/* Details Sheet */}
      <EstablishmentDetailSheet
        business={selectedBusiness}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onApprove={(id, name) => handleAction(id, "approve", name)}
        onSuspend={(id, name) => handleAction(id, "suspend", name)}
        onActivate={(id, name) => handleAction(id, "activate", name)}
        isActionPending={updateBusiness.isPending}
      />
    </AdminLayout>
  );
};

export default Establishments;








