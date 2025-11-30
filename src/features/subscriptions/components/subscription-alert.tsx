"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useFailModal } from "@/features/subscriptions/store/use-fail-modal";
import { useSuccessModal } from "@/features/subscriptions/store/use-success-modal";

const SubscriptionAlertContent = () => {
  const params = useSearchParams();

  const { onOpen: onOpenFail } = useFailModal();
  const { onOpen: onOpenSuccess } = useSuccessModal();

  const canceled = params.get("canceled");
  const success = params.get("success");

  useEffect(() => {
    if (canceled) {
      onOpenFail();
    }

    if (success) {
      onOpenSuccess();
    }
  }, [canceled, onOpenFail, success, onOpenSuccess]);

  return null;
};

export const SubscriptionAlert = () => {
  return (
    <Suspense fallback={null}>
      <SubscriptionAlertContent />
    </Suspense>
  );
};
