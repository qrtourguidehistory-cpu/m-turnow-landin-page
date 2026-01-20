import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  rating: number | null;
  comment: string | null;
  status: string | null;
  created_at: string | null;
  business_id: string | null;
  business_name: string | null;
  client_id: string | null;
  client_name: string | null;
  appointment_id: string | null;
}

export interface ReviewFilters {
  businessId?: string;
  minRating?: number;
  maxRating?: number;
  status?: string;
}

export function useReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: async (): Promise<Review[]> => {
      let query = supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          business_id,
          client_id,
          appointment_id,
          businesses!reviews_business_id_fkey (
            business_name
          ),
          clients!reviews_client_id_fkey (
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }

      if (filters.minRating) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.maxRating) {
        query = query.lte("rating", filters.maxRating);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        created_at: r.created_at,
        business_id: r.business_id,
        business_name: (r.businesses as any)?.business_name || null,
        client_id: r.client_id,
        client_name: (r.clients as any)?.full_name || null,
        appointment_id: r.appointment_id,
      }));
    },
  });
}

export function useBusinessReviews(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-reviews", businessId],
    queryFn: async (): Promise<Review[]> => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          business_id,
          client_id,
          appointment_id,
          clients!reviews_client_id_fkey (
            full_name
          )
        `)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        created_at: r.created_at,
        business_id: r.business_id,
        business_name: null,
        client_id: r.client_id,
        client_name: (r.clients as any)?.full_name || null,
        appointment_id: r.appointment_id,
      }));
    },
    enabled: !!businessId,
  });
}
