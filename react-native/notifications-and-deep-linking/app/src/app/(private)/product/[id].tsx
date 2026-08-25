import { ProductView } from '@/view-models/product/product.view'
import { useProductViewModel } from '@/view-models/product/use-product.view-model'
import { useLocalSearchParams } from 'expo-router'

export default function Product() {
  const { id, openFeedbackBottomSheet } = useLocalSearchParams<{
    id: string
    openFeedbackBottomSheet?: string
  }>()

  const viewModel = useProductViewModel({
    productId: Number(id),
    openFeedbackBottomSheet: !!openFeedbackBottomSheet,
  })

  return <ProductView {...viewModel} />
}
