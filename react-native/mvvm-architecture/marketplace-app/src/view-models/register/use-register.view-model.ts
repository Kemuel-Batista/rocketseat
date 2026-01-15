import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRegisterMutation } from '../../shared/queries/auth/use-register.mutation'
import { useUserStore } from '../../shared/store/user-store'
import { RegisterFormData, registerSchema } from './register.schema'
import { useImage } from '@/shared/hooks/use-image'
import { useState } from 'react'
import { CameraType } from 'expo-image-picker'
import { useUploadAvatarMutation } from '@/shared/queries/auth/use-upload-avatar.mutation'

export const useRegisterViewModel = () => {
  const { updateUser } = useUserStore()
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

  const { handleSelectImage } = useImage({
    callback: setAvatarUri,
    cameraType: CameraType.front,
  })

  function handleSelectAvatar() {
    handleSelectImage()
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  })

  const uploadAvatarMutation = useUploadAvatarMutation()
  const userRegisterMutation = useRegisterMutation({
    onSuccess: async () => {
      if (avatarUri) {
        const { url } = await uploadAvatarMutation.mutateAsync(avatarUri)

        updateUser({ avatarUrl: url })
      }
    },
  })

  const onSubmit = handleSubmit(async (userData) => {
    const { confirmPassword, ...registerData } = userData

    await userRegisterMutation.mutateAsync(registerData)
  })

  return {
    control,
    errors,
    onSubmit,
    avatarUri,
    handleSelectAvatar,
  }
}
