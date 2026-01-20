import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          client_name,
          date,
          start_time,
          status,
          created_at,
          businesses!appointments_business_id_fkey (
            business_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(apt => ({
        id: apt.id,
        client_name: apt.client_name,
        business_name: (apt.businesses as any)?.business_name || null,
        date: apt.date,
        start_time: apt.start_time,
        status: apt.status,
        created_at: apt.created_at,
      }));
    },
    refetchInterval: 30000,
  });
}
