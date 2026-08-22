import { AppButton } from '@/shared/components/app-button'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'

export function OrdersError() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center gap-3">
        <View className="rounded-full bg-danger/10 p-4">
          <Ionicons name="alert" size={80} color={colors.danger} />
        </View>
        <Text className="text-xl font-medium text-danger">
          Erro ao carregar pedidos
        </Text>
      </View>

      <AppButton title="Voltar para produtos" className="mt-12 w-fit" />
    </View>
  )
}
