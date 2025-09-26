import { ActivityIndicator } from 'react-native'

import { colors } from '@/theme/colors'

import { styles } from './styles'

export function Loading() {
  return <ActivityIndicator color={colors.blue[500]} style={styles.container} />
}
