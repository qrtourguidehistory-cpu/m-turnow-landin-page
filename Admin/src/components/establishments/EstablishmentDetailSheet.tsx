import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Business } from "@/hooks/useBusinesses";
import { useBusinessStaff } from "@/hooks/useBusinessStaff";
import { useBusinessServices } from "@/hooks/useBusinessServices";
import { useBusinessProducts } from "@/hooks/useBusinessProducts";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { useReviews } from "@/hooks/useReviews";
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Check, 
  Ban, 
  Building2,
  Users,
  Briefcase,
  Package,
  ExternalLink,
  Mail,
  AlertCircle,
  Loader2,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EstablishmentDetailSheetProps {
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string, name: string) => void;
  onSuspend: (id: string, name: string) => void;
  onActivate: (id: string, name: string) => void;
  isActionPending: boolean;
}

const statusConfig = {
  active: { label: "Activo", className: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pendiente", className: "bg-warning/10 text-warning border-warning/20" },
  suspended: { label: "Suspendido", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

const getStatus = (biz: Business) => {
  if (!biz.is_active) return "suspended";
  if (biz.approval_status === "pending") return "pending";
  if (biz.approval_status === "approved") return "active";
  return "pending";
};

export function EstablishmentDetailSheet({
  business,
  open,
  onOpenChange,
  onApprove,
  onSuspend,
  onActivate,
  isActionPending
}: EstablishmentDetailSheetProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: staff, isLoading: staffLoading } = useBusinessStaff(business?.id);
  const { data: services, isLoading: servicesLoading } = useBusinessServices(business?.id);
  const { data: products, isLoading: productsLoading } = useBusinessProducts(business?.id);
  const { data: sales, isLoading: salesLoading } = useBusinessSales(business?.id);
  const { data: reviews, isLoading: reviewsLoading } = useReviews({ businessId: business?.id });

  if (!business) return null;

  const status = getStatus(business);
  const config = statusConfig[status];

  // Calculate sales distribution using aggregated data from hook
  const salesData = sales ? [
    { name: "Servicios", value: sales.servicesTotal },
    { name: "Productos", value: sales.productsTotal },
  ].filter(d => d.value > 0) : [];

  const totalSales = sales?.totalSales || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header with Cover Image */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            {business.cover_image_url ? (
              <img 
                src={business.cover_image_url} 
                alt={business.business_name || "Cover"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary/30" />
              </div>
            )}
          </div>
          
          {/* Business Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-4 pt-12">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{business.business_name || "Sin nombre"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="text-sm font-medium">{business.average_rating?.toFixed(1) || "0"}</span>
                    <span className="text-sm text-muted-foreground">({business.total_reviews || 0} reseñas)</span>
                  </div>
                  {business.address && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[180px]">{business.address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={cn("shrink-0", config.className)}>
                {config.label}
              </Badge>
            </div>
            
            {business.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{business.description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-12 overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Building2 className="h-4 w-4 mr-2" />
              Info
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Briefcase className="h-4 w-4 mr-2" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <DollarSign className="h-4 w-4 mr-2" />
              Ventas
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 p-4 space-y-6">
              {/* Services Preview */}
              {services && services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Servicios</h3>
                  <div className="space-y-3">
                    {services.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">RD$ {service.price?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    ))}
                    {services.length > 3 && (
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab("services")}>
                        Ver todos los servicios ({services.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Contacto</h3>
                <div className="space-y-3">
                  {business.phone && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Teléfono</p>
                          <p className="font-medium text-foreground">{business.phone}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  
                  {business.email && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{business.email}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Date */}
              <div className="text-sm text-muted-foreground text-center pt-4 border-t border-border">
                Registrado el {format(new Date(business.created_at || new Date()), "dd 'de' MMMM, yyyy", { locale: es })}
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-0 p-4">
              <h3 className="font-semibold text-foreground mb-4">Servicios ({services?.length || 0})</h3>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : services && services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.duration_minutes} min
                            </span>
                            {service.category && (
                              <Badge variant="outline" className="text-xs">{service.category}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-foreground">RD$ {service.price?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay servicios registrados</p>
                </div>
              )}
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-0 p-4">
              <h3 className="font-semibold text-foreground mb-4">Staff ({staff?.length || 0})</h3>
              {staffLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : staff && staff.length > 0 ? (
                <div className="grid gap-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name || ""} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{member.full_name || "Sin nombre"}</p>
                        <p className="text-sm text-muted-foreground">{member.specialties?.join(", ") || "Staff"}</p>
                      </div>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay staff registrado</p>
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 p-4">
              <h3 className="font-semibold text-foreground mb-4">Reseñas ({reviews?.length || 0})</h3>
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={review.rating && review.rating >= 4 ? "default" : review.rating && review.rating < 3 ? "destructive" : "secondary"}>
                            ⭐ {review.rating}
                          </Badge>
                          <span className="font-medium text-sm">{review.client_name || "Anónimo"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.created_at && format(new Date(review.created_at), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay reseñas</p>
                </div>
              )}
            </TabsContent>

            {/* Sales Tab */}
            <TabsContent value="sales" className="mt-0 p-4">
              <h3 className="font-semibold text-foreground mb-4">Resumen de Ventas</h3>
              {salesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sales && sales.totalTransactions > 0 ? (
                <div className="space-y-6">
                  {/* Total Sales */}
                  <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-sm text-muted-foreground">Total de Ventas</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      RD$ {totalSales.toLocaleString()}
                    </p>
                  </div>

                  {/* Sales Distribution Pie Chart */}
                  {salesData.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Distribución de Ingresos</h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={salesData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {salesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => `RD$ ${value.toLocaleString()}`}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Sales by Day */}
                  {sales.dailySales.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Ventas por Día</h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sales.dailySales}>
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(val) => format(new Date(val), "dd/MM")}
                              className="text-xs"
                            />
                            <YAxis className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `RD$ ${value.toLocaleString()}`}
                              labelFormatter={(label) => format(new Date(label), "dd MMM yyyy", { locale: es })}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ventas" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Efectivo</p>
                      <p className="font-bold">RD$ {sales.cashTotal.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Tarjeta</p>
                      <p className="font-bold">RD$ {sales.cardTotal.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Online</p>
                      <p className="font-bold">RD$ {sales.onlineTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos de ventas</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Actions Footer */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            {status === "pending" && (
              <Button 
                className="flex-1"
                onClick={() => {
                  onApprove(business.id, business.business_name || "");
                  onOpenChange(false);
                }}
                disabled={isActionPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Aprobar y Publicar
              </Button>
            )}
            {status === "active" && (
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onSuspend(business.id, business.business_name || "");
                  onOpenChange(false);
                }}
                disabled={isActionPending}
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspender
              </Button>
            )}
            {status === "suspended" && (
              <Button 
                className="flex-1"
                onClick={() => {
                  onActivate(business.id, business.business_name || "");
                  onOpenChange(false);
                }}
                disabled={isActionPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Reactivar
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}