import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean | null;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  total_bookings: number | null;
  total_spent: number | null;
  created_at: string | null;
  business_id: string | null;
  source?: 'partner' | 'client_app';
}

export interface ClientFilters {
  status?: "all" | "active" | "blocked" | "suspended";
  search?: string;
}

export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: async (): Promise<Client[]> => {
      // Fetch from clients table (Partner app clients)
      let clientsQuery = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.status === "active") {
        clientsQuery = clientsQuery.eq("is_active", true).eq("is_blocked", false);
      } else if (filters.status === "blocked") {
        clientsQuery = clientsQuery.eq("is_blocked", true);
      } else if (filters.status === "suspended") {
        clientsQuery = clientsQuery.eq("is_active", false);
      }

      if (filters.search) {
        clientsQuery = clientsQuery.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data: clientsData, error: clientsError } = await clientsQuery;

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }

      // Fetch from client_profiles table (Client app users)
      let profilesQuery = supabase
        .from("client_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.search) {
        profilesQuery = profilesQuery.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error("Error fetching client_profiles:", profilesError);
        // Don't throw - continue with just clients data
      }

      // Map clients from clients table
      const clients: Client[] = (clientsData || []).map(c => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        is_active: c.is_active ?? true,
        is_blocked: c.is_blocked ?? false,
        blocked_reason: c.blocked_reason,
        blocked_at: c.blocked_at,
        total_bookings: c.total_bookings ?? 0,
        total_spent: c.total_spent ?? 0,
        created_at: c.created_at,
        business_id: c.business_id,
        source: 'partner' as const,
      }));

      // Map client_profiles to Client interface (Client app users)
      const profileClients: Client[] = (profilesData || []).map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        is_active: true,
        is_blocked: false,
        blocked_reason: null,
        blocked_at: null,
        total_bookings: 0,
        total_spent: 0,
        created_at: p.created_at,
        business_id: null,
        source: 'client_app' as const,
      }));

      // Combine and deduplicate by email
      const emailMap = new Map<string, Client>();
      
      // Add clients first (they have more data)
      clients.forEach(c => {
        if (c.email) {
          emailMap.set(c.email.toLowerCase(), c);
        } else {
          emailMap.set(c.id, c);
        }
      });

      // Add profile clients that don't exist yet
      profileClients.forEach(p => {
        if (p.email) {
          const existingByEmail = emailMap.get(p.email.toLowerCase());
          if (!existingByEmail) {
            emailMap.set(p.email.toLowerCase(), p);
          }
        } else {
          emailMap.set(p.id, p);
        }
      });

      const allClients = Array.from(emailMap.values());

      // Apply status filter for client_app users
      if (filters.status === "blocked" || filters.status === "suspended") {
        return allClients.filter(c => {
          if (filters.status === "blocked") return c.is_blocked;
          if (filters.status === "suspended") return !c.is_active;
          return true;
        });
      }

      if (filters.status === "active") {
        return allClients.filter(c => c.is_active && !c.is_blocked);
      }

      return allClients;
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
