"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

import { SubscriptionPlans } from "@/features/subscriptions/components/subscription-plans";
import { CurrentPlan } from "@/features/subscriptions/components/current-plan";
import { PaymentMethods } from "@/features/subscriptions/components/payment-methods";
import { BillingHistory } from "@/features/subscriptions/components/billing-history";

const SubscriptionPage = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const completePayment = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/complete-payment?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh subscription data
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        console.log('Payment completed successfully!');
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('Failed to complete payment');
      }
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  }, [queryClient]);

  // Refresh subscription data when the page loads
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    
    // Check if payment was successful and complete it automatically
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const error = urlParams.get('error');
    const canceled = urlParams.get('canceled');
    
    if (success === '1' && sessionId) {
      console.log('Stripe payment successful, completing subscription...');
      completePayment(sessionId);
    } else if (success === 'paypal') {
      console.log('PayPal payment successful!');
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('Payment error:', error);
    } else if (canceled) {
      console.log('Payment was canceled');
    }
  }, [queryClient, completePayment]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CurrentPlan />
          <SubscriptionPlans />
        </div>
        <div className="space-y-8">
          <PaymentMethods />
          <BillingHistory />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
