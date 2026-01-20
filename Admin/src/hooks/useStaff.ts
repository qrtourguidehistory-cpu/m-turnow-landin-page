import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Staff {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  specialties: string[] | null;
  is_active: boolean | null;
  business_id: string | null;
  business_name?: string | null;
  created_at: string | null;
}

export interface StaffFilters {
  search?: string;
  businessId?: string;
}

export function useStaff(filters: StaffFilters = {}) {
  return useQuery({
    queryKey: ["staff", filters],
    queryFn: async (): Promise<Staff[]> => {
      let query = supabase
        .from("staff")
        .select(`
          id,
          full_name,
          email,
          phone,
          bio,
          specialties,
          is_active,
          business_id,
          created_at,
          businesses!staff_business_id_fkey (
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        bio: s.bio,
        specialties: s.specialties,
        is_active: s.is_active,
        business_id: s.business_id,
        business_name: (s.businesses as any)?.business_name || null,
        created_at: s.created_at,
      }));
    },
  });
}
