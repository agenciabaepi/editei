import { useMutation } from "@tanstack/react-query";

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
      console.log('[useRemoveBg] Starting background removal with @imgly/background-removal');
      console.log('[useRemoveBg] Image source:', json.image?.substring(0, 50) + '...');
      const startTime = Date.now();
      
      try {
        // Convert image source to Blob
        let imageBlob: Blob;
        
        if (json.image.startsWith('data:')) {
          // Data URL - convert to blob
          const response = await fetch(json.image);
          imageBlob = await response.blob();
          console.log('[useRemoveBg] Converted data URL to blob, size:', imageBlob.size, 'bytes');
        } else if (json.image.startsWith('http')) {
          // URL - fetch the image
          console.log('[useRemoveBg] Fetching image from URL:', json.image);
          const response = await fetch(json.image);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          imageBlob = await response.blob();
          console.log('[useRemoveBg] Fetched image, size:', imageBlob.size, 'bytes');
        } else {
          throw new Error('Invalid image format. Expected data URL or HTTP URL.');
        }

        if (!imageBlob || imageBlob.size === 0) {
          throw new Error('Empty image data');
        }

        // Process with @imgly/background-removal
        // Dynamic import to avoid SSR issues with WebAssembly
        // webpackIgnore prevents webpack from processing onnxruntime-web dependencies
        console.log('[useRemoveBg] Loading @imgly/background-removal...');
        const { removeBackground } = await import(/* webpackIgnore: true */ "@imgly/background-removal");
        console.log('[useRemoveBg] Processing image with @imgly/background-removal...');
        const resultBlob = await removeBackground(imageBlob);
        console.log('[useRemoveBg] Background removed successfully, result size:', resultBlob.size, 'bytes');
        
        // Convert result blob to data URL
        const resultDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to convert blob to data URL'));
            }
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
        
        if (error.message?.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        }
        
        // Provide more user-friendly error messages
        if (error.message?.includes('WebAssembly') || error.message?.includes('SharedArrayBuffer')) {
          throw new Error('Seu navegador não suporta esta funcionalidade. Por favor, use um navegador moderno.');
        }
        
        throw new Error(error.message || 'Erro ao remover fundo da imagem. Tente novamente.');
      }
    },
  });

  return mutation;
};
