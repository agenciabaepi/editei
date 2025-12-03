'use client';

import { useMutation } from "@tanstack/react-query";
import { removeBackground } from "@imgly/background-removal";

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
    mutationFn: async (request) => {
      console.log('[useRemoveBg] Starting background removal (local processing - maximum quality)');
      console.log('[useRemoveBg] Image source:', request.image?.substring(0, 50) + '...');
      const startTime = Date.now();
      
      try {
        // Converte data URL para blob
        // Usa o tamanho original da imagem para máxima qualidade
        const response = await fetch(request.image);
        const blob = await response.blob();

        // Processa diretamente no navegador com modelo 'large' para melhor qualidade
        // O @imgly/background-removal inicializa onnxruntime-web automaticamente
        console.log('[useRemoveBg] Processing with @imgly/background-removal (model: large)...');
        const resultBlob = await removeBackground(blob, {
          model: 'large', // 'large' = melhor qualidade possível
          outputFormat: 'image/png',
        });

        // Converte resultado para data URL
        const reader = new FileReader();
        const resultDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(resultBlob);
        });

        const elapsed = Date.now() - startTime;
        console.log('[useRemoveBg] Background removal completed in', elapsed, 'ms');
        console.log('[useRemoveBg] Result data URL length:', resultDataUrl.length);
        
        return { data: resultDataUrl };
      } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.error('[useRemoveBg] Error after', elapsed, 'ms:', error);
        console.error('[useRemoveBg] Error message:', error.message);
        console.error('[useRemoveBg] Error stack:', error.stack);
        
        throw new Error(error.message || 'Erro ao remover fundo da imagem. Tente novamente.');
      }
    },
  });

  return mutation;
};
