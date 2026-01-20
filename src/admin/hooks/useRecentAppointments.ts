import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export interface RecentAppointment {
  id: string;
  client_name: string | null;
  business_name: string | null;
  date: string | null;
  start_time: string | null;
  status: string;
  created_at: string | null;
}

export function useRecentAppointments(limit = 10) {
  return useQuery({
    queryKey: ["recent-appointments", limit],
    queryFn: async (): Promise<RecentAppointment[]> => {
      // Solo obtener citas de usuarios de la app cliente (client_profiles)
      // Primero obtenemos los perfiles de clientes nuevos (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: newClients, error: clientsError } = await supabase
        .from("client_profiles")
        .select("id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (clientsError) {
        console.error("Error fetching new clients:", clientsError);
      }

      const newClientIds = new Set((newClients || []).map(c => c.id));

      // Ahora obtenemos las citas de esos clientes
      let query = supabase
        .from("appointments")
        .select(`
          id,
          client_name,
          client_id,
          date,
          start_time,
          status,
          created_at,
          businesses!appointments_business_id_fkey (
            business_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit * 2); // Obtenemos más para filtrar después

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar solo citas de nuevos usuarios de la app cliente
      const filteredData = (data || [])
        .filter(apt => apt.client_id && newClientIds.has(apt.client_id))
        .slice(0, limit)
        .map(apt => ({
          id: apt.id,
          client_name: apt.client_name,
          business_name: (apt.businesses as any)?.business_name || null,
          date: apt.date,
          start_time: apt.start_time,
          status: apt.status,
          created_at: apt.created_at,
        }));

      return filteredData;
    },
    refetchInterval: 30000,
  });
}






