"use client";

import Image from "next/image";
import { CheckCircle2, Crown, Sparkles, Users, Download, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const SubscriptionModal = () => {
  const router = useRouter();
  const { isOpen, onClose } = useSubscriptionModal();

  const handleUpgrade = () => {
    console.log("Upgrade to Pro button clicked");
    onClose();
    router.push("/subscription");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex items-center space-y-4">
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={36}
            height={36}
          />
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="size-6 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock all premium features and AI-powered tools
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ul className="space-y-3">
          <li className="flex items-center">
            <Download className="size-5 mr-3 text-blue-500" />
            <div>
              <p className="text-sm font-medium">All Export Formats</p>
              <p className="text-xs text-muted-foreground">PDF, SVG, WebP and more</p>
            </div>
          </li>
          <li className="flex items-center">
            <Users className="size-5 mr-3 text-green-500" />
            <div>
              <p className="text-sm font-medium">Real-time Collaboration</p>
              <p className="text-xs text-muted-foreground">Share, comment, and edit together</p>
            </div>
          </li>
          <li className="flex items-center">
            <Sparkles className="size-5 mr-3 text-purple-500" />
            <div>
              <p className="text-sm font-medium">AI Background Removal</p>
              <p className="text-xs text-muted-foreground">Remove backgrounds instantly</p>
            </div>
          </li>
          <li className="flex items-center">
            <Palette className="size-5 mr-3 text-pink-500" />
            <div>
              <p className="text-sm font-medium">AI Image Generation</p>
              <p className="text-xs text-muted-foreground">Create images with AI prompts</p>
            </div>
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="size-5 mr-3 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Premium Templates</p>
              <p className="text-xs text-muted-foreground">Access to exclusive designs</p>
            </div>
          </li>
        </ul>
        <DialogFooter className="pt-4 mt-4 gap-y-2">
          <Button
            className="w-full"
            onClick={handleUpgrade}
          >
            <Crown className="size-4 mr-2" />
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
