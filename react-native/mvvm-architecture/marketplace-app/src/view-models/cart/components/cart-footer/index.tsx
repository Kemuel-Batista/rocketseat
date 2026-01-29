import { AppButton } from '@/shared/components/app-button'
import { AppPriceText } from '@/shared/components/app-price-text'
import { useCartStore } from '@/shared/store/cart-store'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'

interface CartFooterProps {
  openCartBottomSheet: () => void
}

export function CartFooter({ openCartBottomSheet }: CartFooterProps) {
  const { total } = useCartStore()

  return (
    <View className="mt-6 rounded-lg bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-[10px] font-semibold uppercase text-gray-600">
          Valor total
        </Text>
        <AppPriceText
          value={total}
          classNameCurrency="text-base text-gray-900 font-bold"
          classNameValue="text-base text-gray-900 font-bold"
        />
      </View>

      <View className="mb-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[10px] font-semibold uppercase text-gray-600">
            Cartões de crédito
          </Text>

          <TouchableOpacity
            onPress={openCartBottomSheet}
            className="flex-row items-center"
          >
            <Ionicons
              name="card-outline"
              size={20}
              color={colors['purple-base']}
            />
            <Text className="ml-2 font-bold text-purple-base">
              Adicionar cartão
            </Text>
          </TouchableOpacity>
        </View>

        <AppButton title="Confirmar compra" className="mt-4" />
      </View>
    </View>
  )
}
