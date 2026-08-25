import { useUserStore } from '@/shared/store/user-store'
import { useForm } from 'react-hook-form'
import { profileSchema, type ProfileFormData } from './profile.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateProfileMutation } from '@/shared/queries/profile/use-update-profile.mutation'
import { useAppModal } from '@/shared/hooks/use-app-modal'
import { useModalStore } from '@/shared/store/modal-store'
import { useCartStore } from '@/shared/store/cart-store'
import { useUploadAvatarMutation } from '@/shared/queries/auth/use-upload-avatar.mutation'
import { useImage } from '@/shared/hooks/use-image'
import { CameraType } from 'expo-image-picker'

export function useProfileViewModel() {
  const { user, logout } = useUserStore()

  const uploadAvatarMutation = useUploadAvatarMutation()
  const updateProfileMutation = useUpdateProfileMutation()

  const { showSelection } = useAppModal()
  const { close } = useModalStore()
  const { clearCart } = useCartStore()

  const { isLoading, handleSelectImage } = useImage({
    callback: async (url) => {
      if (url) {
        await uploadAvatarMutation.mutateAsync(url)
      }
    },
    cameraType: CameraType.front,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      password: undefined,
      newPassword: undefined,
    },
  })

  const validatePasswords = (userData: ProfileFormData) => {
    if (!userData.password) return true
    if (
      userData?.password === userData?.newPassword &&
      userData?.password?.length > 0
    ) {
      return false
    }

    return true
  }

  const onSubmit = handleSubmit(async (userData) => {
    if (!validatePasswords(userData)) return

    await updateProfileMutation.mutateAsync(userData)
  })

  const handleLogout = () =>
    showSelection({
      title: 'Sair',
      message: 'Tem certeza que deseja sair da sua conta?',
      options: [
        {
          text: 'Continuar logado',
          variant: 'primary',
          onPress: close,
        },
        {
          text: 'Sair',
          variant: 'danger',
          onPress: () => {
            clearCart()
            logout()
            close()
          },
        },
      ],
    })

  return {
    control,
    onSubmit,
    avatarUri: user?.avatarUrl ?? null,
    isSubmitting,
    handleLogout,
    handleSelectImage,
    isLoading,
  }
}
