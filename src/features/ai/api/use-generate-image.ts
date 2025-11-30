import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.ai["generate-image"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.ai["generate-image"]["$post"]>["json"];

export const useGenerateImage = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.ai["generate-image"].$post({ json });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string; code?: string; };
        throw new Error(errorData.error || 'Failed to generate image');
      }
      
      return await response.json();
    },
  });

  return mutation;
};
