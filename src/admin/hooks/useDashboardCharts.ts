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
      const { data: appointmentsByDay, error: appointmentsError } = await supabase
        .from("appointments")
        .select("date, status")
        .gte("date", format(sevenDaysAgo, "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"));

      if (appointmentsError) {
        console.error("Error fetching appointments by day:", appointmentsError);
      }

      // Get businesses by category
      const { data: businessesByCategory, error: businessesError } = await supabase
        .from("businesses")
        .select("primary_category")
        .eq("is_active", true);

      if (businessesError) {
        console.error("Error fetching businesses by category:", businessesError);
      }

      // Get appointment status distribution
      const { data: appointmentStatus, error: statusError } = await supabase
        .from("appointments")
        .select("status");

      if (statusError) {
        console.error("Error fetching appointment status:", statusError);
      }

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

      // Get device information from client_devices table instead
      // client_profiles doesn't have device_type or platform columns
      let devicesData = [
        { device: "Android", count: 0 },
        { device: "iOS", count: 0 },
      ];

      try {
        const { data: deviceData, error: deviceError } = await supabase
          .from("client_devices")
          .select("platform")
          .not("platform", "is", null);

        if (!deviceError && deviceData) {
          const platformMap: Record<string, number> = {};
          deviceData.forEach((device: any) => {
            if (device.platform) {
              const platform = device.platform.toLowerCase();
              platformMap[platform] = (platformMap[platform] || 0) + 1;
            }
          });

          if (Object.keys(platformMap).length > 0) {
            devicesData = Object.entries(platformMap).map(([platform, count]) => ({
              device: platform === "ios" ? "iOS" : platform === "android" ? "Android" : platform.charAt(0).toUpperCase() + platform.slice(1),
              count,
            }));
          }
        }
      } catch (err) {
        console.warn("Error fetching device data, using fallback:", err);
        // Use fallback data if query fails
      }

      return {
        appointmentsByDay: appointmentsByDayData,
        businessesByCategory: businessesByCategoryData,
        appointmentStatus: appointmentStatusData,
        devices: devicesData,
      };
    },
  });
}






