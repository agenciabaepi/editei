"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Smartphone, Shield, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
}

interface PaymentMethodSelectorProps {
  plan: Plan;
  onBack: () => void;
}

export const PaymentMethodSelector = ({ plan, onBack }: PaymentMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "paypal" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    try {
      const isLive = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'live';
      
      if (selectedMethod === "stripe") {
        console.log(`Processing Stripe payment (${isLive ? 'LIVE' : 'SANDBOX'}) for ${plan.name} - $${plan.price}/${plan.period}`);
        
        // Redirect to Stripe Checkout with dynamic pricing
        const checkoutData = {
          amount: (plan.price * 100).toString(), // Convert to cents and string
          currency: 'usd',
          planName: plan.name,
          planPeriod: plan.period,
          mode: isLive ? 'live' : 'sandbox'
        };
        
        // Redirect to Stripe checkout API
        window.location.href = `/api/stripe/checkout?${new URLSearchParams(checkoutData)}`;
        
      } else if (selectedMethod === "paypal") {
        console.log(`Processing PayPal payment (${isLive ? 'LIVE' : 'SANDBOX'}) for ${plan.name} - $${plan.price}/${plan.period}`);
        
        // Redirect to PayPal with dynamic pricing
        const paypalData = {
          amount: plan.price.toString(),
          currency: 'USD',
          planName: plan.name,
          planPeriod: plan.period,
          mode: isLive ? 'live' : 'sandbox'
        };
        
        // Redirect to PayPal checkout API
        window.location.href = `/api/paypal/checkout?${new URLSearchParams(paypalData)}`;
      }
      
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>
              Choose your preferred payment method for {plan.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{plan.name} Plan</h3>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${plan.price}</p>
              <p className="text-sm text-gray-500">per {plan.period}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Select Payment Method</h4>
          
          {/* Stripe Card Payment */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === "stripe" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedMethod("stripe")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded border">
                  <CreditCard className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Powered by Stripe</p>
                </div>
              </div>
              {selectedMethod === "stripe" && (
                <Check className="size-5 text-blue-600" />
              )}
            </div>
            
          </div>

          {/* PayPal Payment */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === "paypal" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedMethod("paypal")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded border">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                </div>
              </div>
              {selectedMethod === "paypal" && (
                <Check className="size-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <Shield className="size-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Secure Payment</p>
            <p className="text-xs text-gray-600">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to Plans
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              `Subscribe for $${plan.price}/${plan.period}`
            )}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel anytime from your account settings.
        </p>
      </CardContent>
    </Card>
  );
};
