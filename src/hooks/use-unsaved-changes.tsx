"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

export const useUnsavedChanges = ({ 
  hasUnsavedChanges, 
  message = "You have unsaved changes that will be lost if you leave this page." 
}: UseUnsavedChangesProps) => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Handle browser navigation (back/forward/refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault();
        setShowDialog(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message]);

  const confirmNavigation = useCallback(() => {
    isNavigatingRef.current = true;
    setShowDialog(false);
    
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // Handle browser back/forward
      window.history.back();
    }
  }, [router, pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setShowDialog(false);
    setPendingNavigation(null);
  }, []);

  // Custom navigation function that checks for unsaved changes
  const navigate = useCallback((url: string) => {
    if (hasUnsavedChanges && !isNavigatingRef.current) {
      setPendingNavigation(url);
      setShowDialog(true);
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, router]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    navigate,
    setIsNavigating: (navigating: boolean) => {
      isNavigatingRef.current = navigating;
    }
  };
};
