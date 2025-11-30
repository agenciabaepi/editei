import { protectServer } from "@/features/auth/utils";

import { Banner } from "../(dashboard)/banner";
import { QuickActionsSection } from "../(dashboard)/quick-actions-section";
import { DesignTipsSection } from "../(dashboard)/design-tips-section";
import { ProjectStatsSection } from "../(dashboard)/project-stats-section";
import { EnhancedProjectsSection } from "../(dashboard)/enhanced-projects-section";

export default async function Home() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-8 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <QuickActionsSection />
      <DesignTipsSection />
      <ProjectStatsSection />
      <EnhancedProjectsSection />
    </div>
  );
}
