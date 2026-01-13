import { useForm } from 'react-hook-form'
import { loginSchema, type LoginFormData } from './login.schema'
import { zodResolver } from '@hookform/resolvers/zod'

export function useLoginViewModel() {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return {
    control,
  }
}
