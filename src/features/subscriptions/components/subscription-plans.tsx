"use client";

import { useState } from "react";
import { Crown, Check, Zap, Users, Download, FileImage } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { PaymentMethodSelector } from "@/features/subscriptions/components/payment-method-selector";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started with basic design needs",
    features: [
      "5 projects per month",
      "Basic templates",
      "PNG & JPG export only",
      "Community support",
      "1GB storage"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    period: "month",
    description: "Everything you need for professional design work with AI",
    features: [
      "Unlimited projects",
      "All export formats (PDF, SVG, WebP, etc.)",
      "Real-time collaboration & sharing",
      "Premium templates library",
      "Priority support",
      "100GB storage"
    ],
    popular: true
  }
];

export const SubscriptionPlans = () => {
  const { shouldBlock } = usePaywall();
  const isPro = !shouldBlock;
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "free") {
      // Handle downgrade logic - could show a confirmation dialog
      console.log("Downgrade to free plan requested");
      return;
    }
    
    console.log("Selecting plan:", plan.name);
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  if (showPayment && selectedPlan) {
    return (
      <PaymentMethodSelector 
        plan={selectedPlan}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Plan</CardTitle>
        <CardDescription>
          Select the plan that best fits your design needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrent = (plan.id === "free" && !isPro) || (plan.id === "pro" && isPro);
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-6 ${
                  plan.popular 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200"
                } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                
                {isCurrent && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    {plan.id === "pro" ? (
                      <Crown className="size-8 text-yellow-500" />
                    ) : (
                      <Zap className="size-8 text-gray-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent ? "Current Plan" : `Choose ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileImage className="size-5" />
            Export Format Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Free Plan:</p>
              <ul className="mt-1 space-y-1 text-gray-600">
                <li>• PNG (High quality images)</li>
                <li>• JPG (Compressed images)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700">Pro Plan:</p>
              <ul className="mt-1 space-y-1 text-gray-600">
                <li>• All Free formats</li>
                <li>• PDF (Documents & print)</li>
                <li>• SVG (Scalable vectors)</li>
                <li>• WebP (Modern web format)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="size-5 text-blue-600" />
            Collaboration Features (Pro Only)
          </h4>
          <p className="text-sm text-blue-700">
            Real-time collaboration, team sharing, live cursors, comments system, 
            and project permissions - all included with Pro subscription.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
