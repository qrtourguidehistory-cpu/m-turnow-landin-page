import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export interface Business {
  id: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  category: string | null;
  primary_category: string | null;
  is_active: boolean | null;
  is_public: boolean | null;
  onboarding_completed: boolean | null;
  approval_status: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  created_at: string | null;
  owner_id: string;
  description: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
}

export interface ApprovalRequest {
  id: string;
  business_id: string;
  owner_id: string;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  business?: Business;
}

export interface BusinessFilters {
  status?: "all" | "active" | "pending" | "suspended";
  category?: string;
  search?: string;
}

export function useBusinesses(filters: BusinessFilters = {}) {
  return useQuery({
    queryKey: ["businesses", filters],
    queryFn: async (): Promise<Business[]> => {
      let query = supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters - now using approval_status
      if (filters.status === "active") {
        query = query.eq("is_active", true).eq("approval_status", "approved");
      } else if (filters.status === "pending") {
        query = query.eq("approval_status", "pending");
      } else if (filters.status === "suspended") {
        query = query.eq("is_active", false);
      }

      if (filters.category) {
        query = query.eq("primary_category", filters.category);
      }

      if (filters.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching businesses:", error);
        throw error;
      }
      
      console.log("Businesses fetched:", data?.length || 0, "items");
      return data || [];
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Business> }) => {
      console.log("Updating business:", id, updates);
      
      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Debes iniciar sesión para realizar esta acción");
      }
      
      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        
        // Provide more helpful error messages
        if (error.code === 'PGRST116') {
          throw new Error("No tienes permisos para actualizar este negocio. Asegúrate de tener el rol admin.");
        }
        if (error.message?.includes('row-level security')) {
          throw new Error("Política RLS no permite esta acción. Verifica que tienes rol admin.");
        }
        
        throw error;
      }
      
      console.log("Business updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["pending-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// Fetch businesses with approval_status = 'pending' or 'draft' (solicitudes enviadas desde Partner)
// También incluye negocios que no están aprobados ni son públicos
export function usePendingBusinesses() {
  return useQuery({
    queryKey: ["pending-businesses"],
    queryFn: async (): Promise<Business[]> => {
      // Obtener todos los negocios y filtrar en el cliente
      // Esto es más confiable que usar .or() con múltiples condiciones
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending businesses:", error);
        throw error;
      }
      
      // Filtrar negocios que necesitan aprobación:
      // 1. approval_status = "pending"
      // 2. approval_status = "draft" 
      // 3. approval_status != "approved" y is_public = false
      // 4. approval_status es null y is_public = false
      const filtered = (data || []).filter(biz => {
        const status = biz.approval_status;
        const isPublic = biz.is_public;
        
        return (
          status === "pending" ||
          status === "draft" ||
          (status !== "approved" && !isPublic) ||
          (status === null && !isPublic)
        );
      });
      
      console.log("Pending businesses found:", filtered.length, "out of", data?.length || 0, "total businesses");
      console.log("Pending businesses:", filtered);
      return filtered;
    },
  });
}

// Also fetch from business_approval_requests table for full request info
export function usePendingApprovalRequests() {
  return useQuery({
    queryKey: ["pending-approval-requests"],
    queryFn: async (): Promise<ApprovalRequest[]> => {
      // Primero obtener las solicitudes
      const { data: requests, error: requestsError } = await supabase
        .from("business_approval_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching approval requests:", requestsError);
        throw requestsError;
      }

      if (!requests || requests.length === 0) {
        console.log("No pending approval requests found");
        return [];
      }

      // Obtener los IDs de los negocios
      const businessIds = requests.map(r => r.business_id).filter(Boolean);
      
      if (businessIds.length === 0) {
        return [];
      }

      // Obtener los negocios relacionados
      const { data: businesses, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .in("id", businessIds);

      if (businessesError) {
        console.error("Error fetching businesses for approval requests:", businessesError);
        // Continuar sin los datos de negocios
      }

      // Crear un mapa de negocios por ID
      const businessMap = new Map((businesses || []).map((b: Business) => [b.id, b]));

      // Combinar solicitudes con sus negocios
      const mappedData = requests.map((request: any) => ({
        ...request,
        business: businessMap.get(request.business_id) || null,
      }));
      
      console.log("Pending approval requests found:", mappedData?.length || 0, mappedData);
      return mappedData;
    },
  });
}

export function useUpdateApprovalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      businessId, 
      status, 
      rejectionReason 
    }: { 
      requestId: string; 
      businessId: string; 
      status: "approved" | "rejected"; 
      rejectionReason?: string;
    }) => {
      // Obtener el usuario actual para establecer reviewed_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Debes iniciar sesión para realizar esta acción");
      }

      // Update the approval request
      const { error: requestError } = await supabase
        .from("business_approval_requests")
        .update({ 
          status,
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq("id", requestId);

      if (requestError) {
        console.error("Error updating approval request:", requestError);
        throw requestError;
      }

      // Update the business accordingly
      const businessUpdates = status === "approved" 
        ? { 
            approval_status: "approved", 
            is_public: true, 
            is_active: true,
            onboarding_completed: true
          }
        : { 
            approval_status: "rejected",
            is_public: false
          };

      const { data, error: businessError } = await supabase
        .from("businesses")
        .update(businessUpdates)
        .eq("id", businessId)
        .select()
        .single();

      if (businessError) {
        console.error("Error updating business:", businessError);
        throw businessError;
      }
      
      console.log("Successfully approved business:", data);
      return data;
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["pending-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}






