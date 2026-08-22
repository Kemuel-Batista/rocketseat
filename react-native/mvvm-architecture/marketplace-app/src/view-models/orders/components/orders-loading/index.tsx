import { colors } from '@/styles/colors'
import { ActivityIndicator, Text, View } from 'react-native'

export function OrdersLoading() {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="large" color={colors['purple-base']} />
      <Text className="text-base text-gray-300">Carregando pedidos...</Text>
    </View>
  )
}
