import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { CartFooterProps } from '.'
import { useCartFooterViewModel } from './use-cart-footer.view-model'
import { AppPriceText } from '@/shared/components/app-price-text'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import { CreditCardItem } from '../credit-card-item'
import { AppButton } from '@/shared/components/app-button'

interface CartFooterViewProps
  extends CartFooterProps, ReturnType<typeof useCartFooterViewModel> {}

export function CartFooterView({
  openCartBottomSheet,
  creditCards,
  isLoadingCreditCards,
  total,
  selectedCreditCard,
  setSelectedCreditCard,
  submitOrderMutation,
  isLoadingOrder,
}: CartFooterViewProps) {
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

        {isLoadingCreditCards ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color={colors['purple-base']} />
            <Text className="mt-2 text-sm text-gray-500">
              Carregando cartões
            </Text>
          </View>
        ) : (
          <FlatList
            data={creditCards}
            renderItem={({ item: creditCard }) => (
              <CreditCardItem
                creditCard={creditCard}
                isSelected={creditCard.id === selectedCreditCard?.id}
                setSelectedCreditCard={setSelectedCreditCard}
              />
            )}
            keyExtractor={(item) => `credit-card-id-${item.id}`}
            className="gap-2"
          />
        )}

        <AppButton
          title="Confirmar compra"
          className="mt-4"
          onPress={submitOrderMutation}
          isLoading={isLoadingOrder}
        />
      </View>
    </View>
  )
}
