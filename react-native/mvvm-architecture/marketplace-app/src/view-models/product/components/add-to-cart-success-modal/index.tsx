import { AppButton } from '@/shared/components/app-button'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'

interface AddToCartSuccessModalProps {
  productName: string
  onGoToCart: () => void
  onClose: () => void
  onContinueShopping: () => void
}

export function AddToCartSuccessModal({
  productName,
  onGoToCart,
  onClose,
  onContinueShopping,
}: AddToCartSuccessModalProps) {
  return (
    <View className="w-full max-w-sm rounded-xl bg-white p-6">
      <View className="mb-4 items-center">
        <View className="mb-3 size-16 items-center justify-center rounded-full bg-green-100">
          <Ionicons name="checkmark" size={32} color={colors.success} />
        </View>

        <Text className="text-center text-xl font-bold text-gray-900">
          Produto adicionado!
        </Text>
      </View>

      <Text className="mb-6 text-center text-gray-600">
        <Text className="font-semibold">{productName}</Text> foi adicionado ao
        seu carrinho com sucesso!
      </Text>

      <View className="gap-3">
        <AppButton title="Ver carrinho" onPress={onGoToCart} />

        <AppButton
          title="Continuar comprando"
          variant="outlined"
          onPress={onContinueShopping}
        />
      </View>
    </View>
  )
}
