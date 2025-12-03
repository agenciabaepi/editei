import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["$patch"], 200>;
type RequestType = {
  name?: string;
  json?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
};

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationKey: ["project", { id }],
    mutationFn: async (json) => {
      console.log('[UpdateProject] Starting mutation for project:', id);
      try {
        const response = await client.api.projects[":id"].$patch({ 
          param: { id },
          json
        } as any);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[UpdateProject] Response not OK:', response.status, errorText);
          throw new Error(`Failed to update project: ${errorText}`);
        }

        const result = await response.json();
        console.log('[UpdateProject] Successfully updated project:', id);
        return result;
      } catch (error) {
        console.error('[UpdateProject] Error updating project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
    },
    onError: () => {
      toast.error("Failed to update project");
    }
  });

  return mutation;
};
