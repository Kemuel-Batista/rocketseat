import { MaterialIcons } from '@expo/vector-icons'
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native'

import type { TargetResponse } from '@/database/use-target-database'

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
          {data.percentage} • {data.current} de {data.name}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} />
    </TouchableOpacity>
  )
}
