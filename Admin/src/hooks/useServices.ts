import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string | null;
  is_active: boolean | null;
  business_id: string | null;
  business_name?: string | null;
  created_at: string | null;
}

export interface ServiceFilters {
  search?: string;
  businessId?: string;
}

export function useServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: ["services", filters],
    queryFn: async (): Promise<Service[]> => {
      let query = supabase
        .from("services")
        .select(`
          id,
          name,
          description,
          price,
          duration_minutes,
          category,
          is_active,
          business_id,
          created_at,
          businesses!services_business_id_fkey (
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration_minutes: s.duration_minutes,
        category: s.category,
        is_active: s.is_active,
        business_id: s.business_id,
        business_name: (s.businesses as any)?.business_name || null,
        created_at: s.created_at,
      }));
    },
  });
}
