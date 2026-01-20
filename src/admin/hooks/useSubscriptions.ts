import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export interface BusinessSubscription {
  id: string;
  business_id: string;
  owner_id: string;
  status: "active" | "inactive" | "past_due" | "cancelled" | "suspended";
  subscription_plan: string;
  monthly_fee: number;
  payment_method: string | null;
  paypal_subscription_id: string | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_due_date: string | null;
  amount_paid: number;
  amount_due: number;
  days_overdue: number;
  payment_history: any[];
  notes: string | null;
  manually_activated: boolean;
  activated_by: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  business_name?: string | null;
  owner_email?: string | null;
}

export interface SubscriptionFilters {
  status?: string;
  search?: string;
}

export function useSubscriptions(filters: SubscriptionFilters = {}) {
  return useQuery({
    queryKey: ["subscriptions", filters],
    queryFn: async (): Promise<BusinessSubscription[]> => {
      let query = supabase
        .from("business_subscriptions")
        .select(`
          *,
          business:businesses!business_subscriptions_business_id_fkey (
            business_name
          ),
          owner:profiles!business_subscriptions_owner_id_fkey (
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.search) {
        query = query.or(`business.business_name.ilike.%${filters.search}%,owner.email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching subscriptions:", error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        business_name: item.business?.business_name || null,
        owner_email: item.owner?.email || null,
      }));
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BusinessSubscription> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Debes iniciar sesión para realizar esta acción");
      }

      const updateData: any = { ...updates };
      
      // If manually activating, add metadata
      if (updates.status === "active" && updates.manually_activated) {
        updateData.activated_by = user.id;
        updateData.activated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("business_subscriptions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

