import { Image, Text, TouchableOpacity, View } from 'react-native'
import type { useProductCardViewModel } from './use-product-card.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'

export function ProductCardView({
  product,
}: ReturnType<typeof useProductCardViewModel>) {
  return (
    <TouchableOpacity className="my-1 mb-2 h-[157px] w-[48%] overflow-hidden rounded-xl bg-white p-[4px] shadow-sm">
      <View>
        <Image
          source={{ uri: product.photo }}
          className="h-[96px] w-full rounded-md"
          resizeMode="cover"
        />
        <View className="absolute right-0 top-0 flex-row items-center rounded-b-lg rounded-r-none bg-white px-2 py-1">
          <Ionicons name="star" size={12} color={colors['blue-base']} />
          <Text className="ml-1 text-sm font-semibold">
            {product.ratingCount}
          </Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="mb-1 text-xs font-semibold" numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text>R$ {product.value}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
