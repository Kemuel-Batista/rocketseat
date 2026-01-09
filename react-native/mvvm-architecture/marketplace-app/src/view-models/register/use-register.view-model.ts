import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from './register.schema'
import { useRegisterMutation } from '@/shared/queries/auth/use-register.mutation'

export function useRegisterViewModel() {
  const userRegisterMutation = useRegisterMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: 'kemuel',
      email: 'kemuel@gmail.com',
      password: '32312321',
      confirmPassword: '32312321',
      phone: '41984545987',
    },
  })

  const onSubmit = handleSubmit((data) => {
    const { name, email, password, phone } = data

    userRegisterMutation.mutateAsync({
      name,
      email,
      password,
      phone,
    })
  })
  return {
    control,
    errors,
    onSubmit,
  }
}
