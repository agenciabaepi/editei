import { protectServer } from "@/features/auth/utils";
import { EnhancedProjectsSection } from "../../(dashboard)/enhanced-projects-section";

export default async function ProjectsPage() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
        <p className="text-gray-600 mt-1">Gerencie todos os seus projetos</p>
      </div>
      <EnhancedProjectsSection />
    </div>
  );
}

