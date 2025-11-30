import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { toast } from "sonner";

interface ProjectRenameHandlerProps {
  projectId: string;
  onRename: (newName: string) => void;
}

export const ProjectRenameHandler = ({ projectId, onRename }: ProjectRenameHandlerProps) => {
  const updateMutation = useUpdateProject(projectId);

  const handleRename = (newName: string) => {
    updateMutation.mutate(
      { name: newName },
      {
        onSuccess: () => {
          toast.success("Project renamed successfully");
          onRename(newName);
        },
        onError: () => {
          toast.error("Failed to rename project");
        }
      }
    );
  };

  return { handleRename, isLoading: updateMutation.isPending };
};
