import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserComment } from "../../services/product.service";
import { UpdateCommentRequest } from "../../interfaces/http/update-comment";
import { Toast } from "toastify-react-native";

export const useUpdateCommentMutation = (productId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (comment: UpdateCommentRequest) => updateUserComment(comment),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user-comment", productId] });
      queryClient.invalidateQueries({
        queryKey: ["product-comments", productId],
      });

      Toast.success(
        response.message || "Avaliação atualizada com sucesso!",
        "top"
      );
    },
    onError: (error) => {
      Toast.error(
        error.message ??
          "Erro ao atualizar valiação, tente novamente em instantes."
      );
    },
  });

  return mutation;
};
