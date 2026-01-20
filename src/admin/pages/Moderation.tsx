import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { AlertTriangle, Shield, Eye, Clock, Search, CheckCircle, XCircle, Star, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Moderation = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch blocked clients
  const { data: blockedClients = [] } = useQuery({
    queryKey: ["blocked-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, email, phone, blocked_at, blocked_reason, business_id")
        .eq("is_blocked", true)
        .order("blocked_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch suspended businesses
  const { data: suspendedBusinesses = [] } = useQuery({
    queryKey: ["suspended-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, email, phone, updated_at")
        .eq("is_active", false)
        .order("updated_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent reviews with client and business info
  const { data: recentReviews = [] } = useQuery({
    queryKey: ["reviews-moderation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, 
          rating, 
          comment, 
          status, 
          created_at,
          business_id,
          client_id,
          businesses!reviews_business_id_fkey (
            business_name
          ),
          clients!reviews_client_id_fkey (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        business_name: r.businesses?.business_name || null,
        client_name: r.clients?.full_name || null,
        client_email: r.clients?.email || null,
      }));
    }
  });

  // Low rating reviews (< 3 stars)
  const lowRatingReviews = recentReviews.filter((r: any) => r.rating && r.rating < 3);

  const stats = {
    blockedClients: blockedClients.length,
    suspendedBusinesses: suspendedBusinesses.length,
    pendingReviews: recentReviews.filter((r: any) => r.status === 'pending').length,
    lowRatings: lowRatingReviews.length
  };

  const filteredClients = blockedClients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBusinesses = suspendedBusinesses.filter(business =>
    business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = recentReviews.filter((review: any) =>
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Moderación y Seguridad</h1>
          <p className="text-muted-foreground mt-1">Gestión de contenido, usuarios bloqueados y reseñas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Bloqueados</p>
                  <p className="text-2xl font-semibold">{stats.blockedClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negocios Suspendidos</p>
                  <p className="text-2xl font-semibold">{stats.suspendedBusinesses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Star className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reseñas Bajas (&lt;3⭐)</p>
                  <p className="text-2xl font-semibold">{stats.lowRatings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sistema</p>
                  <p className="text-2xl font-semibold text-green-600">Seguro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews">Reseñas ({recentReviews.length})</TabsTrigger>
            <TabsTrigger value="clients">Clientes Bloqueados ({blockedClients.length})</TabsTrigger>
            <TabsTrigger value="businesses">Negocios Suspendidos ({suspendedBusinesses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reseñas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rating</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Establecimiento</TableHead>
                        <TableHead>Comentario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No hay reseñas recientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReviews.map((review: any) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              <Badge variant={review.rating && review.rating >= 4 ? "default" : review.rating && review.rating < 3 ? "destructive" : "secondary"}>
                                ⭐ {review.rating || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{review.client_name || "Anónimo"}</p>
                                  <p className="text-xs text-muted-foreground">{review.client_email || "-"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{review.business_name || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="truncate text-sm">
                                {review.comment || <span className="text-muted-foreground">Sin comentario</span>}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                review.status === 'completed' ? 'default' :
                                review.status === 'pending' ? 'secondary' : 'outline'
                              }>
                                {review.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {review.created_at 
                                ? format(new Date(review.created_at), "dd MMM yyyy", { locale: es })
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clientes Bloqueados ({filteredClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha Bloqueo</TableHead>
                        <TableHead>Razón</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No hay clientes bloqueados
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.full_name || "Sin nombre"}</TableCell>
                            <TableCell>{client.email || "-"}</TableCell>
                            <TableCell>{client.phone || "-"}</TableCell>
                            <TableCell>
                              {client.blocked_at 
                                ? format(new Date(client.blocked_at), "dd MMM yyyy", { locale: es })
                                : "-"
                              }
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {client.blocked_reason || "Sin especificar"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Negocios Suspendidos ({filteredBusinesses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Negocio</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Última Actualización</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No hay negocios suspendidos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBusinesses.map((business) => (
                          <TableRow key={business.id}>
                            <TableCell className="font-medium">{business.business_name || "Sin nombre"}</TableCell>
                            <TableCell>{business.email || "-"}</TableCell>
                            <TableCell>{business.phone || "-"}</TableCell>
                            <TableCell>
                              {business.updated_at 
                                ? format(new Date(business.updated_at), "dd MMM yyyy", { locale: es })
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Reactivar
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Moderation;








