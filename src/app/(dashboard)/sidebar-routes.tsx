"use client";

import { 
  CreditCard, 
  Crown, 
  Home, 
  MessageCircleQuestion, 
  Image, 
  Settings, 
  Trash2
} from "lucide-react";
import { usePathname } from "next/navigation";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SidebarItem } from "./sidebar-item";

export const SidebarRoutes = () => {
  const { shouldBlock, isLoading } = usePaywall();
  const { onOpen } = useSubscriptionModal();

  const pathname = usePathname();

  const handleUpgrade = () => {
    console.log("Upgrade to Pro clicked from sidebar");
    onOpen();
  };

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      {shouldBlock && !isLoading && (
        <>
          <div className="px-3">
            <Button
              onClick={handleUpgrade}
              className="w-full rounded-xl border-none hover:bg-white hover:opacity-75 transition"
              variant="outline"
              size="lg"
            >
              <Crown className="mr-2 size-4 fill-yellow-500 text-yellow-500" />
              Atualizar para Pro
            </Button>
          </div>
          <div className="px-3">
            <Separator />
          </div>
        </>
      )}
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/dashboard" icon={Home} label="Início" isActive={pathname === "/dashboard"} />
        <SidebarItem href="/dashboard/images" icon={Image} label="Minhas Imagens" isActive={pathname === "/dashboard/images"} />
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/dashboard/settings" icon={Settings} label="Configurações" isActive={pathname === "/dashboard/settings"} />
        <SidebarItem href="/dashboard/trash" icon={Trash2} label="Lixeira" isActive={pathname === "/dashboard/trash"} />
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem
          href="mailto:suporte@editei.com.br"
          icon={MessageCircleQuestion}
          label="Obter Ajuda"
        />
      </ul>
    </div>
  );
};
