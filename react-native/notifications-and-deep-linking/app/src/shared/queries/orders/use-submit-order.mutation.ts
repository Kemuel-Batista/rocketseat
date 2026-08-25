import { submitOrder } from '@/shared/services/orders.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Toast } from 'toastify-react-native'

export function useSubmitOrderMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    },
    onError: (error) => {
      console.log(error)
      Toast.error(error.message ?? 'Falha ao realizar pedido', 'top')
    },
  })

  return mutation
}
