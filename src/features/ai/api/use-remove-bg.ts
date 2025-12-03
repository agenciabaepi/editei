import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";

type RequestType = {
  image: string;
};

type ResponseType = {
  data: string; // data URL da imagem sem fundo
};

export const useRemoveBg = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      console.log('[useRemoveBg] Starting background removal via API');
      console.log('[useRemoveBg] Image source:', json.image?.substring(0, 50) + '...');
      const startTime = Date.now();
      
      try {
        const response = await client.api.ai["remove-bg"].$post({
          json: {
            image: json.image,
          },
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string; code?: string };
          const errorMessage = errorBody.error || 'Unknown error';
          console.error('[useRemoveBg] API error:', response.status, errorMessage);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        const elapsed = Date.now() - startTime;
        console.log('[useRemoveBg] Background removal completed in', elapsed, 'ms');
        console.log('[useRemoveBg] Result data URL length:', result.data?.length || 0);
        
        return result;
      } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.error('[useRemoveBg] Error after', elapsed, 'ms:', error);
        console.error('[useRemoveBg] Error message:', error.message);
        
        if (error.message?.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        }
        
        throw new Error(error.message || 'Erro ao remover fundo da imagem. Tente novamente.');
      }
    },
  });

  return mutation;
};
