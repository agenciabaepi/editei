"use client";

import { Calendar, Download, Receipt, Loader } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBillingHistory } from "@/features/subscriptions/api/use-billing-history";

interface BillingRecord {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
}

export const BillingHistory = () => {
  const { data: billingHistory = [], isLoading, error } = useBillingHistory();

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="size-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-5" />
          Billing History
        </CardTitle>
        <CardDescription>
          View and download your past invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {billingHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="size-12 mx-auto mb-3 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices will appear here after your first payment</p>
          </div>
        ) : (
          billingHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{record.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">${record.amount}</p>
                  <Badge 
                    variant={
                      record.status === "paid" ? "default" :
                      record.status === "pending" ? "secondary" : "destructive"
                    }
                    className="text-xs"
                  >
                    {record.status}
                  </Badge>
                </div>
                {record.invoiceUrl && record.status === "paid" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadInvoice(record.invoiceUrl!)}
                  >
                    <Download className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
