import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { Text, TouchableOpacity } from 'react-native'

import { DismissKeyboardView } from '@/components/dismiss-keyboard-view'
import type { PublicStackParamsList } from '@/routes/public-routes'

export function Login() {
  const navigation = useNavigation<StackNavigationProp<PublicStackParamsList>>()

  return (
    <DismissKeyboardView>
      <Text>Tela de login!</Text>
      <TouchableOpacity onPress={() => navigation.navigate('register')}>
        <Text>Regitrar</Text>
      </TouchableOpacity>
    </DismissKeyboardView>
  )
}
