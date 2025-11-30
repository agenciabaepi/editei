import { useQuery } from "@tanstack/react-query";

interface ProjectStats {
  totalProjects: number;
  projectsThisWeek: number;
  totalDownloads: number;
  downloadsThisMonth: number;
  designTime: number;
  designTimeThisWeek: number;
}

export const useProjectStats = () => {
  return useQuery<ProjectStats>({
    queryKey: ["project-stats"],
    queryFn: async () => {
      const response = await fetch("/api/projects/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch project stats");
      }
      
      return response.json();
    },
  });
};
