import { Text, TouchableOpacity, View } from 'react-native'
import type { useCreditCardItemViewModel } from './use-credit-card-item.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import type { CreditCard } from '@/shared/interfaces/credit-card'

interface CreditCardItemViewProps extends ReturnType<
  typeof useCreditCardItemViewModel
> {
  isSelected: boolean
  setSelectedCreditCard: (creditCard: CreditCard) => void
}

export function CreditCardItemView({
  creditCard,
  formattedExpirationDate,
  formattedCardNumber,
  isSelected,
  setSelectedCreditCard,
}: CreditCardItemViewProps) {
  return (
    <TouchableOpacity
      onPress={() => setSelectedCreditCard(creditCard)}
      className={`rounded-lg border bg-white p-4 ${isSelected ? 'border-purple-base' : 'border-gray-100'}`}
    >
      <View className="flex-row justify-center">
        <View className="mr-4">
          <Ionicons
            name="card-outline"
            size={24}
            color={colors['purple-base']}
          />
        </View>

        <View className="flex-1">
          <Text className="text-base">Cartão final {formattedCardNumber}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {formattedExpirationDate}
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="pencil" size={18} color={colors['purple-base']} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
