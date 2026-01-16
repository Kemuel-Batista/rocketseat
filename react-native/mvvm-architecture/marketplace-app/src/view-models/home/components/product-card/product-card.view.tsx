import { Image, Text, TouchableOpacity, View } from 'react-native'
import type { useProductCardViewModel } from './use-product-card.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'

export function ProductCardView({
  product,
}: ReturnType<typeof useProductCardViewModel>) {
  return (
    <TouchableOpacity className="my-1 mb-2 h-[157px] w-[48px] overflow-hidden rounded-xl bg-white p-[4px] shadow-sm">
      <View className="flex-1 items-center justify-center">
        <Image
          source={{ uri: product.photo }}
          resizeMode="cover"
          className="h-[96px] w-full rounded-[6px]"
        />

        <View className="absolute right-0 top-0 flex-row items-center rounded-r-none rounded-bl-lg bg-white px-2 py-1">
          <Ionicons name="star" size={12} color={colors['blue-base']} />
          <Text className="ml-1 text-sm font-semibold">
            {product.ratingCount}
          </Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="mb-1 text-xs font-semibold" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text>R$ {product.value}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
