import { colors } from '@/styles/colors'
import { ActivityIndicator, Text, View } from 'react-native'

interface EmptyListProps {
  isLoadingComments: boolean
}

export function EmptyList({ isLoadingComments }: EmptyListProps) {
  if (isLoadingComments) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color={colors['purple-base']} size="small" />
        <Text className="mt-2 text-gray-500">Carregando avaliações...</Text>
      </View>
    )
  }

  return (
    <View className="items-center py-8">
      <Text className="text-base text-gray-500">
        Ainda não há avaliações para este produto
      </Text>
      <Text className="mt-1 text-sm text-gray-400">
        Seja o primeiro a avaliar!
      </Text>
    </View>
  )
}
