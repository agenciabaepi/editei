"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, TriangleAlert, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";

const ForgotPasswordCard = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('An error occurred while sending reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check your email</CardTitle>
          <CardDescription className="text-gray-600">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              If you don&apos;t see the email? Try checking your spam folder first. 
              Still can&apos;t find it? The reset link will expire in 1 hour for security reasons.
            </p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive an email? Check your spam folder or 
            </p>
            <Button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              variant="outline"
              className="w-full"
            >
              Try again
            </Button>
          </div>

          <div className="text-center">
            <Link href="/sign-in" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors">
              <ArrowLeft className="mr-2 size-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Forgot your password?</CardTitle>
        <CardDescription className="text-gray-600">
          No worries! Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-x-2 text-sm text-red-600">
          <TriangleAlert className="size-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <CardContent className="space-y-6 px-6 pb-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              disabled={loading}
              required
              className="h-12"
            />
            <p className="text-xs text-gray-500">
              We&apos;ll send a password reset link to this email address
            </p>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="mr-2 size-5" />
                Send reset link
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/sign-in" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            Back to sign in
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export { ForgotPasswordCard };
