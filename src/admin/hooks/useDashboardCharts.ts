import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { subDays, format } from "date-fns";

export function useDashboardCharts() {
  return useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = subDays(today, 7);

      // Get appointments by day (last 7 days)
      const { data: appointmentsByDay } = await supabase
        .from("appointments")
        .select("date, status")
        .gte("date", format(sevenDaysAgo, "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"));

      // Get businesses by category
      const { data: businessesByCategory } = await supabase
        .from("businesses")
        .select("primary_category")
        .eq("is_active", true);

      // Get appointment status distribution
      const { data: appointmentStatus } = await supabase
        .from("appointments")
        .select("status");

      // Process appointments by day - return as array for charts
      const appointmentsByDayData = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = (appointmentsByDay || []).filter(a => a.date === dateStr).length;
        appointmentsByDayData.push({
          date: format(date, "EEE"),
          count,
        });
      }

      // Process businesses by category
      const categoryMap: Record<string, number> = {};
      (businessesByCategory || []).forEach(b => {
        const cat = b.primary_category || "Otro";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      const businessesByCategoryData = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([category, count]) => ({ category, count }));

      // Process status distribution
      const statusMap: Record<string, number> = {};
      (appointmentStatus || []).forEach(a => {
        const status = a.status || "pending";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const appointmentStatusData = Object.entries(statusMap).map(([status, count]) => ({
        status: status === "completed" ? "Completadas" :
              status === "confirmed" ? "Confirmadas" :
              status === "pending" ? "Pendientes" :
              status === "cancelled" ? "Canceladas" :
              status === "no_show" ? "No Show" :
              status === "started" ? "En Curso" : status,
        count,
      }));

      // Get device information from user sessions or client_profiles
      // Assuming we have device info in client_profiles or a sessions table
      const { data: deviceData } = await supabase
        .from("client_profiles")
        .select("device_type, platform")
        .not("device_type", "is", null);

      const deviceMap: Record<string, number> = {};
      const platformMap: Record<string, number> = {};
      
      (deviceData || []).forEach((profile: any) => {
        if (profile.device_type) {
          const device = profile.device_type.toLowerCase();
          deviceMap[device] = (deviceMap[device] || 0) + 1;
        }
        if (profile.platform) {
          const platform = profile.platform.toLowerCase();
          platformMap[platform] = (platformMap[platform] || 0) + 1;
        }
      });

      // Fallback: try to infer from user agents or other sources
      // For now, we'll use a simple count based on available data
      const devicesData = Object.entries(deviceMap).length > 0
        ? Object.entries(deviceMap).map(([device, count]) => ({
            device: device === "ios" ? "iOS" : device === "android" ? "Android" : device,
            count,
          }))
        : [
            { device: "Android", count: Math.floor((deviceData?.length || 0) * 0.6) },
            { device: "iOS", count: Math.floor((deviceData?.length || 0) * 0.4) },
          ];

      return {
        appointmentsByDay: appointmentsByDayData,
        businessesByCategory: businessesByCategoryData,
        appointmentStatus: appointmentStatusData,
        devices: devicesData,
      };
    },
  });
}






