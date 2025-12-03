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
      console.log('[UpdateProject] Request data:', { 
        id, 
        hasJson: !!json.json, 
        width: json.width, 
        height: json.height,
        hasThumbnail: !!json.thumbnail 
      });
      try {
        const response = await client.api.projects[":id"].$patch({ 
          param: { id },
          json
        } as any);

        console.log('[UpdateProject] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[UpdateProject] Response not OK:', response.status, errorText);
          
          // Provide more specific error messages
          if (response.status === 401) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          } else if (response.status === 404) {
            throw new Error('Projeto não encontrado.');
          } else if (response.status === 403) {
            throw new Error('Sem permissão para atualizar este projeto.');
          }
          
          throw new Error(`Falha ao atualizar projeto: ${errorText}`);
        }

        const result = await response.json();
        console.log('[UpdateProject] Successfully updated project:', id);
        return result;
      } catch (error: any) {
        console.error('[UpdateProject] Error updating project:', error);
        console.error('[UpdateProject] Error message:', error?.message);
        console.error('[UpdateProject] Error stack:', error?.stack);
        
        // Re-throw with more context if needed
        if (error.message) {
          throw error;
        }
        throw new Error('Erro ao salvar projeto. Verifique sua conexão e tente novamente.');
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
