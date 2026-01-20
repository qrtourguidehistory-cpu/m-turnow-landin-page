import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  createdAt: string;
  severity: "info" | "warning" | "error" | "success";
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        pendingRes,
        suspendedRes,
        blockedRes,
        lowReviewsRes,
        newClientsRes,
        newBusinessesRes,
        recentStaffRes,
      ] = await Promise.all([
        // Pending businesses
        supabase
          .from("businesses")
          .select("id, business_name, created_at, email")
          .eq("approval_status", "pending")
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Suspended businesses
        supabase
          .from("businesses")
          .select("id, business_name, updated_at, email")
          .eq("is_active", false)
          .order("updated_at", { ascending: false })
          .limit(10),
        
        // Blocked clients
        supabase
          .from("clients")
          .select("id, full_name, blocked_at, blocked_reason, email")
          .eq("is_blocked", true)
          .order("blocked_at", { ascending: false })
          .limit(10),
        
        // Low reviews (rating < 3)
        supabase
          .from("reviews")
          .select("id, rating, comment, created_at, business_id")
          .lt("rating", 3)
          .order("created_at", { ascending: false })
          .limit(10),
        
        // New clients (last 7 days)
        supabase
          .from("clients")
          .select("id, full_name, email, phone, created_at")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10),
        
        // New businesses (last 7 days)
        supabase
          .from("businesses")
          .select("id, business_name, email, primary_category, approval_status, created_at")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Recent staff additions (last 7 days)
        supabase
          .from("staff")
          .select("id, full_name, business_id, created_at, businesses(business_name)")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      return {
        pendingBusinesses: pendingRes.data || [],
        suspendedBusinesses: suspendedRes.data || [],
        blockedClients: blockedRes.data || [],
        lowRatingReviews: lowReviewsRes.data || [],
        newClients: newClientsRes.data || [],
        newBusinesses: newBusinessesRes.data || [],
        newStaff: (recentStaffRes.data || []).map((s: any) => ({
          ...s,
          business_name: s.businesses?.business_name || "Negocio",
        })),
        stats: {
          pending: pendingRes.data?.length || 0,
          suspended: suspendedRes.data?.length || 0,
          blocked: blockedRes.data?.length || 0,
          lowReviews: lowReviewsRes.data?.length || 0,
          newClients: newClientsRes.data?.length || 0,
          newBusinesses: newBusinessesRes.data?.length || 0,
        },
      };
    },
    refetchInterval: 60000,
  });
}
