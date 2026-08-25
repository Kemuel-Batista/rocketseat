import { useAppModal } from '@/shared/hooks/use-app-modal'
import { updateUserProfile } from '@/shared/services/profile.service'
import { useUserStore } from '@/shared/store/user-store'
import { useMutation } from '@tanstack/react-query'
import { Toast } from 'toastify-react-native'

export function useUpdateProfileMutation() {
  const { updateUser } = useUserStore()
  const { showSuccess } = useAppModal()

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      updateUser({
        ...response.user,
      })
      showSuccess({
        title: 'Sucesso!',
        message: 'Dados cadastrais atualizados com sucesso!',
      })
    },
    onError: (error) => {
      Toast.error(error.message ?? 'Falha ao atualizar os dados do usuário')
    },
  })

  return mutation
}
