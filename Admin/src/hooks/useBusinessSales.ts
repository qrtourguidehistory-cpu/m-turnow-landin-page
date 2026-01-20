import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessSales {
  totalSales: number;
  totalTransactions: number;
  servicesTotal: number;
  productsTotal: number;
  cashTotal: number;
  cardTotal: number;
  onlineTotal: number;
  dailySales: {
    date: string;
    total: number;
  }[];
}

export function useBusinessSales(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business-sales", businessId],
    queryFn: async (): Promise<BusinessSales> => {
      if (!businessId) {
        return {
          totalSales: 0,
          totalTransactions: 0,
          servicesTotal: 0,
          productsTotal: 0,
          cashTotal: 0,
          cardTotal: 0,
          onlineTotal: 0,
          dailySales: [],
        };
      }

      const { data, error } = await supabase
        .from("daily_sales_summaries")
        .select("*")
        .eq("business_id", businessId)
        .order("summary_date", { ascending: false })
        .limit(30);

      if (error) throw error;

      const summaries = data || [];
      
      // Calculate totals
      const totalSales = summaries.reduce((acc, s) => acc + (s.total_sales || 0), 0);
      const totalTransactions = summaries.reduce((acc, s) => acc + (s.total_transactions || 0), 0);
      const servicesTotal = summaries.reduce((acc, s) => acc + (s.services_total || 0), 0);
      const productsTotal = summaries.reduce((acc, s) => acc + (s.products_total || 0), 0);
      const cashTotal = summaries.reduce((acc, s) => acc + (s.cash_total || 0), 0);
      const cardTotal = summaries.reduce((acc, s) => acc + (s.card_total || 0), 0);
      const onlineTotal = summaries.reduce((acc, s) => acc + (s.online_total || 0), 0);

      // Daily sales for chart
      const dailySales = summaries.slice(0, 7).reverse().map(s => ({
        date: s.summary_date,
        total: s.total_sales || 0,
      }));

      return {
        totalSales,
        totalTransactions,
        servicesTotal,
        productsTotal,
        cashTotal,
        cardTotal,
        onlineTotal,
        dailySales,
      };
    },
    enabled: !!businessId,
  });
}
