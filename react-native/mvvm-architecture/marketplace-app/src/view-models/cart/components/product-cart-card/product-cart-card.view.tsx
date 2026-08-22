import { Image, Text, TouchableOpacity, View } from 'react-native'

import type { CartProduct } from '@/shared/store/cart-store'
import type { useProductCartCardViewModel } from './use-product-cart-card.view-model'
import { AppPriceText } from '@/shared/components/app-price-text'
import { buildImageUrl } from '@/shared/helpers/build-image-url'

interface ProductCartCardViewProps extends ReturnType<
  typeof useProductCartCardViewModel
> {
  product: CartProduct
}

export function ProductCartCardView({
  product,
  handleIncrement,
  handleDecrement,
}: ProductCartCardViewProps) {
  return (
    <View className="mb-2 h-[71px] flex-row items-center rounded-lg bg-white px-2">
      <Image
        source={{ uri: buildImageUrl(product?.image ?? '') }}
        className="mr-4 size-16 rounded-md"
        resizeMode="cover"
      />
      <View className="mr-3 flex-1 gap-1">
        <Text className="line-clamp-1 max-w-[180px] text-sm text-gray-400">
          {product.name}
        </Text>

        <AppPriceText
          classNameCurrency="text-sm font-bold"
          classNameValue="text-sm font-bold"
          value={Number(product.price)}
        />
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => handleDecrement(product.id, product.quantity)}
          className="size-[18px] items-center justify-center rounded-md border-[1.2px] border-purple-base"
        >
          <Text className="text-center text-base font-medium leading-none text-purple-base">
            -
          </Text>
        </TouchableOpacity>

        <View className="mx-2 min-w-[24px] items-center justify-center border-b border-gray-300">
          <Text className="font-medium text-gray-700">{product.quantity}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleIncrement(product.id, product.quantity)}
          className="size-[18px] items-center justify-center rounded-md border-[1.2px] border-purple-base"
        >
          <Text className="text-center text-base font-medium leading-none text-purple-base">
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
