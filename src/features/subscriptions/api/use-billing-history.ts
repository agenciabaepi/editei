import { useQuery } from "@tanstack/react-query";

interface BillingRecord {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
}

export const useBillingHistory = () => {
  return useQuery<BillingRecord[]>({
    queryKey: ["billing-history"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/billing-history");
      
      if (!response.ok) {
        throw new Error("Failed to fetch billing history");
      }
      
      const data = await response.json();
      return data.data || [];
    },
  });
};
