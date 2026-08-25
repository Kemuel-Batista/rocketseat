import { useMutation } from "@tanstack/react-query";
import * as authService from "../../services/auths.service";
import { RegisterHttpParams } from "../../interfaces/http/register";
import { AuthResponse } from "../../interfaces/http/auth-response";
import { useUserStore } from "../../store/user-store";

interface UserRegisterMutationParams {
  onSuccess?: () => void;
}

export const useRegisterMutation = ({
  onSuccess,
}: UserRegisterMutationParams = {}) => {
  const { setSession } = useUserStore();

  const mutation = useMutation({
    mutationFn: (userData: RegisterHttpParams) =>
      authService.register(userData),
    onSuccess: (response) => {
      setSession({
        refreshToken: response.refreshToken,
        token: response.token,
        user: response.user,
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return mutation;
};
