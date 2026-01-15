import { uploadAvatar } from '@/shared/services/auth.service'
import { useMutation } from '@tanstack/react-query'
import { Toast } from 'toastify-react-native'

export function useUploadAvatarMutation() {
  const mutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (response) => {
      console.log(response)
    },
    onError: (error) => {
      console.log(error)
      Toast.error('Erro ao fazer upload da foto do perfil')
    },
  })

  return mutation
}
