import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.projects[":id"]["duplicate"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":id"]["duplicate"]["$post"]>["param"];

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (param) => {
      const response = await client.api.projects[":id"].duplicate.$post({ 
        param,
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        if (response.status === 403 && errorData.error === "Project limit reached") {
          throw new Error(errorData.message || "Project limit reached. Upgrade to Pro for unlimited projects.");
        }
        throw new Error("Failed to duplicate project");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      if (error.message.includes("Project limit reached") || error.message.includes("Upgrade to Pro")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to duplicate project");
      }
    }
  });

  return mutation;
};
