import type { LoginHttpParams } from '@/shared/interfaces/http/login'
import { login } from '@/shared/services/auth.service'
import { useMutation } from '@tanstack/react-query'

export function useLoginMutation() {
  const mutation = useMutation({
    mutationFn: (userData: LoginHttpParams) => login(userData),
    onSuccess: (response) => {
      console.log(response)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  return mutation
}
