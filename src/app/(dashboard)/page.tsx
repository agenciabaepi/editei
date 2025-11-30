"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Banner } from "./banner";
import { QuickActionsSection } from "./quick-actions-section";
import { DesignTipsSection } from "./design-tips-section";
import { ProjectStatsSection } from "./project-stats-section";
import { EnhancedProjectsSection } from "./enhanced-projects-section";
import { TemplatesSection } from "./templates-section";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok || !(await response.json()).user) {
          router.push('/sign-in');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/sign-in');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <QuickActionsSection />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TemplatesSection />
          <EnhancedProjectsSection />
        </div>
        <div className="space-y-8">
          <DesignTipsSection />
          <ProjectStatsSection />
        </div>
      </div>
    </div>
  );
};

