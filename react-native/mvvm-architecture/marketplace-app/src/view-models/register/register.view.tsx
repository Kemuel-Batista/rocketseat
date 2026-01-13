import { useState, type FC } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { useRegisterViewModel } from './use-register.view-model'
import { AppInputController } from '@/shared/components/app-input-controller'
import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { router } from 'expo-router'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { SafeAreaView } from 'react-native-safe-area-context'

export const RegisterView: FC<ReturnType<typeof useRegisterViewModel>> = ({
  onSubmit,
  control,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <ScrollView className="flex-1 px-10">
          <AuthFormHeader
            title="Acesse sua conta"
            subTitle="Informe seu e-mail e senha"
          />

          <AppInputController
            leftIcon="person-outline"
            label="NOME"
            control={control}
            name="name"
          />

          <AppInputController
            leftIcon="mail-outline"
            label="E-MAIL"
            control={control}
            name="email"
          />

          <AppInputController
            leftIcon="call-outline"
            label="TELEFONE"
            control={control}
            name="phone"
          />

          <AppInputController
            leftIcon="lock-closed-outline"
            label="SENHA"
            control={control}
            name="password"
            secureTextEntry
          />

          <AppInputController
            leftIcon="lock-closed-outline"
            label="CONFIRMAR SENHA"
            control={control}
            name="confirmPassword"
            secureTextEntry
          />

          <TouchableOpacity onPress={onSubmit}>
            <Text>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
