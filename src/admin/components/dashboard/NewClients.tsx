import { cn } from "../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Loader2, UserPlus } from "lucide-react";

interface NewClient {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
}

export function NewClients() {
  const { data: newClients, isLoading, error } = useQuery({
    queryKey: ["new-clients"],
    queryFn: async (): Promise<NewClient[]> => {
      // Obtener usuarios nuevos de la app cliente (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("client_profiles")
        .select("id, full_name, email, phone, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="card-elevated p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Nuevos usuarios clientes</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Nuevos usuarios clientes</h3>
        <p className="text-sm text-destructive">Error al cargar los usuarios</p>
      </div>
    );
  }

  return (
    <div className="card-elevated">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Nuevos usuarios clientes</h3>
      </div>
      
      <div className="divide-y divide-border">
        {newClients?.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay nuevos usuarios</p>
          </div>
        ) : (
          newClients?.map((client) => {
            const initials = (client.full_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            
            return (
              <div key={client.id} className="p-4 table-row-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">{initials}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {client.full_name || "Usuario sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {client.email || client.phone || "Sin contacto"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {client.created_at && (
                  <p className="text-xs text-muted-foreground mt-2 ml-11">
                    Registrado {formatDistanceToNow(new Date(client.created_at), { addSuffix: true, locale: es })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

