import { AppButton } from '@/shared/components/app-button'
import { AppPriceText } from '@/shared/components/app-price-text'
import type { ProductInterface } from '@/shared/interfaces/product'
import { View } from 'react-native'

interface AddToCardFooterProps {
  product: ProductInterface
  onAddToCart: () => void
}

export function AddToCardFooter({
  product,
  onAddToCart,
}: AddToCardFooterProps) {
  return (
    <View className="fixed bottom-0 left-0 right-0 h-[126px] flex-row items-center justify-between bg-white p-7">
      <AppPriceText value={Number(product.value)} />

      <AppButton
        title="Adicionar"
        leftIcon="cart-outline"
        className="h-[40px] w-[120px]"
        onPress={onAddToCart}
      />
    </View>
  )
}
