import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletedProject {
  id: string;
  name: string;
  deleted_at: string;
  width: number;
  height: number;
  thumbnail: string | null;
}

export const useDeletedProjects = () => {
  return useQuery<DeletedProject[]>({
    queryKey: ["deleted-projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects/deleted");
      
      if (!response.ok) {
        throw new Error("Failed to fetch deleted projects");
      }
      
      return response.json();
    },
  });
};

export const useRestoreProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/restore`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json() as any;
        if (response.status === 403 && errorData.error === "Project limit reached") {
          throw new Error(errorData.message || "Project limit reached. Delete some projects or upgrade to Pro for unlimited projects.");
        }
        throw new Error("Failed to restore project");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stats"] });
    },
  });
};

export const usePermanentDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/permanent`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to permanently delete project");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stats"] });
    },
  });
};
