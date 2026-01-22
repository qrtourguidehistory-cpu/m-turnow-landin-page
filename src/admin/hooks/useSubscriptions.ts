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
  current_period_end: string | null;
  amount_paid: number;
  amount_due: number;
  days_overdue: number;
  payment_history: any[];
  notes: string | null;
  manually_activated: boolean;
  activation_note: string | null;
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
      let subscriptionsQuery = supabase
        .from("business_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.status && filters.status !== "all") {
        subscriptionsQuery = subscriptionsQuery.eq("status", filters.status);
      }

      const { data: subscriptionsData, error: subscriptionsError } = await subscriptionsQuery;

      if (subscriptionsError) {
        console.error("Error fetching subscriptions:", subscriptionsError);
        throw subscriptionsError;
      }

      if (!subscriptionsData || subscriptionsData.length === 0) {
        return [];
      }

      // Get business IDs and owner IDs
      const businessIds = subscriptionsData.map(s => s.business_id).filter(Boolean);
      const ownerIds = subscriptionsData.map(s => s.owner_id).filter(Boolean);

      // Fetch businesses
      const { data: businessesData } = await supabase
        .from("businesses")
        .select("id, business_name")
        .in("id", businessIds);

      // Fetch owner profiles
      let profilesData = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", ownerIds);
        profilesData = data;
      } catch (err) {
        console.warn("Could not fetch profiles, using auth.users instead");
      }

      // Create lookup maps
      const businessMap = new Map((businessesData || []).map(b => [b.id, b.business_name]));
      const profileMap = new Map((profilesData || []).map(p => [p.id, p.email]));

      // Combine data
      let combinedData = subscriptionsData.map((sub: any) => ({
        ...sub,
        business_name: businessMap.get(sub.business_id) || null,
        owner_email: profileMap.get(sub.owner_id) || null,
      }));

      // Apply search filter if provided
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        combinedData = combinedData.filter(sub => 
          (sub.business_name || "").toLowerCase().includes(searchLower) ||
          (sub.owner_email || "").toLowerCase().includes(searchLower)
        );
      }

      return combinedData;
    },
  });
}

export function useSubscriptionByBusinessId(businessId: string | null) {
  return useQuery({
    queryKey: ["subscription", businessId],
    queryFn: async (): Promise<BusinessSubscription | null> => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from("business_subscriptions")
        .select("*")
        .eq("business_id", businessId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No subscription found
          return null;
        }
        throw error;
      }

      // Fetch business name and owner email
      const { data: businessData } = await supabase
        .from("businesses")
        .select("id, business_name")
        .eq("id", businessId)
        .single();

      let ownerEmail = null;
      if (data.owner_id) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("id", data.owner_id)
            .single();
          ownerEmail = profileData?.email || null;
        } catch (err) {
          console.warn("Could not fetch owner profile");
        }
      }

      return {
        ...data,
        business_name: businessData?.business_name || null,
        owner_email: ownerEmail,
      };
    },
    enabled: !!businessId,
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      
      // Si se canceló o suspendió, también invalidar para refrescar el estado
      if (variables.updates.status === "cancelled" || variables.updates.status === "suspended") {
        queryClient.invalidateQueries({ queryKey: ["subscription", data?.business_id] });
      }
    },
  });
}

