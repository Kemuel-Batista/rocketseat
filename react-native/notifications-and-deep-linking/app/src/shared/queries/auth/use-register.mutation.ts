import type { RegisterHttpParams } from '@/shared/interfaces/http/register'
import { register } from '@/shared/services/auth.service'
import { useUserStore } from '@/shared/store/user-store'
import { useMutation } from '@tanstack/react-query'

interface UserRegisterMutationParams {
  onSuccess?: () => void
}

export function useRegisterMutation({
  onSuccess,
}: UserRegisterMutationParams = {}) {
  const { setSession } = useUserStore()

  const mutation = useMutation({
    mutationFn: (userData: RegisterHttpParams) => register(userData),
    onSuccess: (response) => {
      setSession({
        refreshToken: response.refreshToken,
        token: response.token,
        user: response.user,
      })
      onSuccess?.()
    },
    onError: (error) => {
      console.log(error)
    },
  })

  return mutation
}
