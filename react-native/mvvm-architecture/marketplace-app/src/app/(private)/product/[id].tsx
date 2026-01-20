import { ProductView } from '@/view-models/product/product.view'
import { useProductViewModel } from '@/view-models/product/use-product.view-model'
import { useLocalSearchParams } from 'expo-router'

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const viewModel = useProductViewModel({ productId: Number(id) })

  return <ProductView {...viewModel} />
}
