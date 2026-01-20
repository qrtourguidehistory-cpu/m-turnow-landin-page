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
  business_id: string;
  business_name?: string | null;
  created_at: string | null;
}

export interface ProductFilters {
  search?: string;
  businessId?: string;
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

export function useAllProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["all-products", filters],
    queryFn: async (): Promise<BusinessProduct[]> => {
      let query = supabase
        .from("inventory")
        .select(`
          *,
          businesses!inventory_business_id_fkey (
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
        current_stock: item.current_stock,
        min_stock_level: item.min_stock_level,
        category: item.category,
        sku: item.sku,
        supplier: item.supplier,
        is_active: item.is_active,
        business_id: item.business_id,
        business_name: item.businesses?.business_name || null,
        created_at: item.created_at,
      }));
    },
  });
}






