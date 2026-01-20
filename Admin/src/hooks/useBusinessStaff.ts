import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  bio: string | null;
  specialties: string[] | null;
}

export function useBusinessStaff(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-staff", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching staff:", error);
        throw error;
      }

      return data as StaffMember[];
    },
    enabled: !!businessId,
  });
}
