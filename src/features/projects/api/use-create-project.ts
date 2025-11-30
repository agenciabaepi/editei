import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api.projects)["$post"], 200>;
type RequestType = {
  name: string;
  json: string;
  width: number;
  height: number;
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.projects.$post({ json });

      if (!response.ok) {
        const errorData = await response.json() as any;
        if (response.status === 403 && errorData.error === "Project limit reached") {
          throw new Error(errorData.message || "Project limit reached. Upgrade to Pro for unlimited projects.");
        }
        throw new Error("Something went wrong");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project created.");

      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      if (error.message.includes("Project limit reached") || error.message.includes("Upgrade to Pro")) {
        toast.error(error.message);
      } else {
        toast.error(
          "Failed to create project. The session token may have expired, logout and login again, and everything will work fine."
        );
      }
    },
  });

  return mutation;
};
