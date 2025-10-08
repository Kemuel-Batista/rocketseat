import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { Text, TouchableOpacity, View } from 'react-native'

import type { PublicStackParamsList } from '@/routes'

export function Login() {
  const navigation = useNavigation<StackNavigationProp<PublicStackParamsList>>()

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Tela de login!</Text>
      <TouchableOpacity onPress={() => navigation.navigate('register')}>
        <Text>Regitrar</Text>
      </TouchableOpacity>
    </View>
  )
}
