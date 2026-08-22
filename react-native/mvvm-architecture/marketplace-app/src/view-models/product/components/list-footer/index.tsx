import { colors } from '@/styles/colors'
import { ActivityIndicator, View } from 'react-native'

interface ListFooterProps {
  isLoadingMore: boolean
}

export function ListFooter({ isLoadingMore }: ListFooterProps) {
  if (!isLoadingMore) return null

  return (
    <View className="py-4">
      <ActivityIndicator color={colors['purple-base']} size="small" />
    </View>
  )
}
