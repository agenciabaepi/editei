"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  type: "card" | "paypal";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

export const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Manage your payment methods for subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="size-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No payment methods added yet</p>
            <p className="text-sm text-gray-500 mt-2">Payment methods will be managed through Stripe and PayPal during checkout</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  {method.type === "card" ? (
                    <CreditCard className="size-4" />
                  ) : (
                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                  )}
                </div>
                <div>
                  {method.type === "card" ? (
                    <div>
                      <p className="font-medium">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        {method.brand?.toUpperCase()} • Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-600">{method.email}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMethod(method.id)}
                  disabled={method.isDefault}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
