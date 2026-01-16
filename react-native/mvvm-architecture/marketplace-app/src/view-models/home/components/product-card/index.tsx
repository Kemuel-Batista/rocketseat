import type { ProductInterface } from '@/shared/interfaces/product'
import { Text, View } from 'react-native'

interface ProductCardProps {
  product: ProductInterface
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View>
      <Text>{product.name}</Text>
    </View>
  )
}
