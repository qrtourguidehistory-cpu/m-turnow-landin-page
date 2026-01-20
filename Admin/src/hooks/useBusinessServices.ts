import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_usd: number | null;
  price_mxn: number | null;
  duration_minutes: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useBusinessServices(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-services", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching services:", error);
        throw error;
      }

      return data as BusinessService[];
    },
    enabled: !!businessId,
  });
}
