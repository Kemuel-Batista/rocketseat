import { AppPriceText } from '@/shared/components/app-price-text'
import { buildImageUrl } from '@/shared/helpers/build-image-url'
import type { OrderInterface } from '@/shared/interfaces/order'
import { format } from 'date-fns'
import { Image, Text, View } from 'react-native'

interface OrderItemProps {
  order: OrderInterface
}

export function OrderItem({ order }: OrderItemProps) {
  return (
    <View className="mb-3 flex-row items-center rounded-lg bg-white p-3">
      <Image
        source={{ uri: buildImageUrl(order.productPhoto) }}
        className="mr-4 h-[81px] w-[88px] rounded-lg"
        resizeMode="cover"
      />

      <View className="flex-1 justify-between">
        <View className="mb-6 flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 text-sm font-semibold text-gray-900"
            numberOfLines={1}
          >
            {order.productName}
          </Text>

          <Text className="text-sm text-gray-600">
            {format(order.createdAt, 'dd/MM/yyyy')}
          </Text>
        </View>

        <View className="mb-1 flex-row items-center">
          <Text className="mr-1 text-sm text-gray-600">
            {order.quantity} {order.quantity > 1 ? 'Unidades' : 'Unidade'}{' '}
            •{' '}
          </Text>
          <AppPriceText
            value={order.totalPrice}
            classNameCurrency="text-sm text-gray-600"
            classNameValue="text-sm text-gray-600"
          />
        </View>
        <Text className="text-sm text-gray-600">
          {order.creditCard.maskedNumber}
        </Text>
      </View>
    </View>
  )
}
