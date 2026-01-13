import { useState, type FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useRegisterViewModel } from './use-register.view-model'
import { AppInput } from '@/shared/components/app-input'
import { AppInputController } from '@/shared/components/app-input-controller'

export const RegisterView: FC<ReturnType<typeof useRegisterViewModel>> = ({
  onSubmit,
  control,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View className="flex-1 items-center justify-center">
      <AppInputController
        leftIcon="mail-outline"
        label="E-MAIL"
        control={control}
        name="email"
      />

      <TouchableOpacity onPress={onSubmit}>
        <Text>Registrar</Text>
      </TouchableOpacity>
    </View>
  )
}
