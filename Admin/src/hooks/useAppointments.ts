import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Appointment {
  id: string;
  client_name: string | null;
  client_email: string | null;
  business_name: string | null;
  service_name: string | null;
  staff_name: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  price: number | null;
  source: string | null;
  created_at: string | null;
}

export interface AppointmentFilters {
  status?: string;
  date?: string;
  search?: string;
  businessId?: string;
}

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: async (): Promise<Appointment[]> => {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          client_name,
          client_email,
          date,
          start_time,
          end_time,
          status,
          price,
          source,
          created_at,
          business_id,
          businesses!appointments_business_id_fkey (
            business_name
          ),
          services!appointments_service_id_fkey (
            name
          ),
          staff!appointments_staff_id_fkey (
            full_name
          )
        `)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(200);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.date) {
        query = query.eq("date", filters.date);
      }

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }

      if (filters.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(apt => ({
        id: apt.id,
        client_name: apt.client_name,
        client_email: apt.client_email,
        business_name: (apt.businesses as any)?.business_name || null,
        service_name: (apt.services as any)?.name || null,
        staff_name: (apt.staff as any)?.full_name || null,
        date: apt.date,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        price: apt.price,
        source: apt.source,
        created_at: apt.created_at,
      }));
    },
  });
}