"use client";

import { Crown, Check, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

export const CurrentPlan = () => {
  const { shouldBlock } = usePaywall();
  const isPro = !shouldBlock;
  const { onOpen } = useSubscriptionModal();

  const handleUpgrade = () => {
    console.log("Upgrade to Pro clicked from current plan");
    onOpen();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-5 text-yellow-500" />
          Current Plan
        </CardTitle>
        <CardDescription>
          Your current subscription plan and benefits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {isPro ? "Pro Plan" : "Free Plan"}
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "Active" : "Current"}
              </Badge>
            </h3>
            <p className="text-gray-600 mt-1">
              {isPro 
                ? "Unlimited access to all features" 
                : "Limited access with basic features"
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {isPro ? "$9.99" : "$0"}
            </p>
            <p className="text-sm text-gray-500">
              {isPro ? "per month" : "forever"}
            </p>
          </div>
        </div>

        {isPro && (
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
            <Calendar className="size-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Next billing date</p>
              <p className="text-sm text-green-700">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{isPro ? 'Unlimited projects' : '5 projects per month'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{isPro ? 'Premium templates library' : 'Basic templates'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{isPro ? 'All export formats (PDF, SVG, WebP)' : 'PNG & JPG export only'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{isPro ? '100GB storage' : '1GB storage'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`size-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${isPro ? '' : 'text-gray-400'}`}>
                Real-time collaboration & sharing
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              <span className="text-sm">{isPro ? 'Priority support' : 'Community support'}</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
