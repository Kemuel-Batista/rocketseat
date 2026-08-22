import type { LoginHttpParams } from '@/shared/interfaces/http/login'
import { login } from '@/shared/services/auth.service'
import { useUserStore } from '@/shared/store/user-store'
import { useMutation } from '@tanstack/react-query'

export function useLoginMutation() {
  const { setSession } = useUserStore()

  const mutation = useMutation({
    mutationFn: (userData: LoginHttpParams) => login(userData),
    onSuccess: (response) => {
      setSession(response)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  return mutation
}
