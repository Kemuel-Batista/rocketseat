import { useState, type FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import type { useRegisterViewModel } from './use-register.view-model'
import { AppInput } from '@/shared/components/app-input'

export const RegisterView: FC<ReturnType<typeof useRegisterViewModel>> = ({
  onSubmit,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View className="flex-1 items-center justify-center">
      <AppInput
        label="E-mail"
        leftIcon="mail-outline"
        value={email}
        onChangeText={setEmail}
        error="E-mail inválido"
      />
      <AppInput
        label="Senha"
        leftIcon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onSubmit}>
        <Text>Registrar</Text>
      </TouchableOpacity>
    </View>
  )
}
