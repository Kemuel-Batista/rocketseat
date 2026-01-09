import type { RegisterHttpParams } from '@/shared/interfaces/http/register'
import { register } from '@/shared/services/auth.service'
import { useMutation } from '@tanstack/react-query'

export function useRegisterMutation() {
  const mutation = useMutation({
    mutationFn: (userData: RegisterHttpParams) => register(userData),
    onSuccess: (response) => {
      console.log(response)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  return mutation
}
