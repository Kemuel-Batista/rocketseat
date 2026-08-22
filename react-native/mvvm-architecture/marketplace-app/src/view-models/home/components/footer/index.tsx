import { colors } from '@/styles/colors'
import { ActivityIndicator, View } from 'react-native'

interface FooterProps {
  isLoading: boolean
}

export function Footer({ isLoading }: FooterProps) {
  if (!isLoading) {
    return null
  }

  return (
    <View>
      <ActivityIndicator size="small" color={colors['purple-base']} />
    </View>
  )
}
