import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  name: keyof typeof MaterialIcons.glyphMap
}

export function ButtonIcon({ name, ...rest }: Props) {
  return (
    <TouchableOpacity {...rest}>
      <MaterialIcons name={name} size={32} />
    </TouchableOpacity>
  )
}
