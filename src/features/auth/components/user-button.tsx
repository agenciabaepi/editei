"use client";

import { Crown, Loader, LogOut, User, Settings, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

export const UserButton = () => {
  const { shouldBlock, triggerPaywall, isLoading } = usePaywall();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          if (data.success && data.user.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, [user]);

  if (loading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />
  }

  if (!user) {
    return null;
  }

  const name = user.name || user.email;
  const imageUrl = user.image;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        {!shouldBlock && !isLoading && (
          <div className="absolute -top-1 -left-1 z-10 flex items-center justify-center">
            <div className="rounded-full bg-white flex items-center justify-center p-1 drop-shadow-sm">
              <Crown className="size-3 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}
        <Avatar className="size-10 hover:opcaity-75 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="bg-blue-500 font-medium text-white flex items-center justify-center">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="h-10"
        >
          <User className="size-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/subscription")}
          className="h-10"
        >
          <Settings className="size-4 mr-2" />
          Subscription & Billing
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => router.push("/admin")}
            className="h-10"
          >
            <Shield className="size-4 mr-2" />
            Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10" onClick={() => logout()}>
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
