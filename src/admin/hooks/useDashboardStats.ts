import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export interface DashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  suspendedBusinesses: number;
  totalClients: number;
  activeClients: number;
  blockedClients: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalStaff: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch businesses stats
      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select("id, is_active, is_public, onboarding_completed");

      if (bizError) throw bizError;

      const totalBusinesses = businesses?.length || 0;
      const activeBusinesses = businesses?.filter(b => b.is_active && b.onboarding_completed).length || 0;
      const pendingBusinesses = businesses?.filter(b => !b.onboarding_completed).length || 0;
      const suspendedBusinesses = businesses?.filter(b => !b.is_active).length || 0;

      // Fetch clients stats
      const { data: clients, error: clientError } = await supabase
        .from("clients")
        .select("id, is_active, is_blocked");

      if (clientError) throw clientError;

      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c.is_active && !c.is_blocked).length || 0;
      const blockedClients = clients?.filter(c => c.is_blocked).length || 0;

      // Fetch appointments stats
      const todayStr = today.toISOString().split('T')[0];
      const weekStr = startOfWeek.toISOString().split('T')[0];
      const monthStr = startOfMonth.toISOString().split('T')[0];

      const { data: appointmentsData, error: apptError } = await supabase
        .from("appointments")
        .select("id, date, status, created_at");

      if (apptError) throw apptError;

      const appointmentsToday = appointmentsData?.filter(a => a.date === todayStr).length || 0;
      const appointmentsThisWeek = appointmentsData?.filter(a => a.date && a.date >= weekStr).length || 0;
      const appointmentsThisMonth = appointmentsData?.filter(a => a.date && a.date >= monthStr).length || 0;
      const cancelledAppointments = appointmentsData?.filter(a => a.status === 'cancelled').length || 0;
      const noShowAppointments = appointmentsData?.filter(a => a.status === 'no_show').length || 0;

      // Fetch staff count
      const { count: staffCount, error: staffError } = await supabase
        .from("staff")
        .select("id", { count: "exact", head: true });

      if (staffError) throw staffError;

      return {
        totalBusinesses,
        activeBusinesses,
        pendingBusinesses,
        suspendedBusinesses,
        totalClients,
        activeClients,
        blockedClients,
        appointmentsToday,
        appointmentsThisWeek,
        appointmentsThisMonth,
        cancelledAppointments,
        noShowAppointments,
        totalStaff: staffCount || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}






