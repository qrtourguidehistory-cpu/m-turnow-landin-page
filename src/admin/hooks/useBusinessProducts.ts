import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export interface BusinessProduct {
  id: string;
  name: string;
  description: string | null;
  unit_price: number | null;
  cost_price: number | null;
  current_stock: number;
  min_stock_level: number;
  category: string | null;
  sku: string | null;
  supplier: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useBusinessProducts(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-products", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      return data as BusinessProduct[];
    },
    enabled: !!businessId,
  });
}






