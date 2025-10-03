import { MaterialIcons } from '@expo/vector-icons'
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native'

import type { TargetResponse } from '@/database/use-target-database'
import { numberToCurrency } from '@/utils/number-to-currency'

import { styles } from './styles'

type Props = TouchableOpacityProps & {
  data: TargetResponse
}

export function Target({ data, ...rest }: Props) {
  return (
    <TouchableOpacity style={styles.container} {...rest}>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {data.name}
        </Text>

        <Text style={styles.status}>
          {data.percentage.toFixed(0)}% • {numberToCurrency(data.current)} de{' '}
          {numberToCurrency(data.amount)}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} />
    </TouchableOpacity>
  )
}
