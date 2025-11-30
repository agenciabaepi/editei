import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  return mutation;
};
