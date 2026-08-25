import { useMutation } from "@tanstack/react-query";
import * as authService from "../../services/auths.service";
import { LoginHttpParams } from "../../interfaces/http/login";
import { useUserStore } from "../../store/user-store";
import { Toast } from "toastify-react-native";

export const useLoginMutation = () => {
  const { setSession } = useUserStore();

  const mutation = useMutation({
    mutationFn: (userData: LoginHttpParams) => authService.login(userData),
    onSuccess: (response) => {
      setSession(response);
    },
    onError: (error) => {
      console.log(error);
      Toast.error(error.message ?? "Falha ao logar");
    },
  });

  return mutation;
};
