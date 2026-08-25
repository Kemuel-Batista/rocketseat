import { useForm } from 'react-hook-form'
import { loginSchema, type LoginFormData } from './login.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoginMutation } from '@/shared/queries/auth/use-login.mutation'
import { useOneSignal } from '@/shared/hooks/use-one-signal'

export function useLoginViewModel() {
  const { playerId } = useOneSignal()

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useLoginMutation()

  const onSubmit = handleSubmit(async (userFormData) => {
    await loginMutation.mutateAsync({
      ...userFormData,
      notificationToken: playerId,
    })
  })

  return {
    control,
    onSubmit,
  }
}
