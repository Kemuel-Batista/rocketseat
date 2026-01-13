import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { useRegisterViewModel } from './use-register.view-model'
import { AppInputController } from '@/shared/components/app-input-controller'
import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { router } from 'expo-router'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { SafeAreaView } from 'react-native-safe-area-context'

export function RegisterView({
  control,
  onSubmit,
}: ReturnType<typeof useRegisterViewModel>) {
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
            placeholder="Seu nome completo"
          />

          <AppInputController
            leftIcon="call-outline"
            label="TELEFONE"
            control={control}
            name="phone"
            placeholder="(00) 00000-0000"
          />

          <Text className="mt-6 text-base font-bold text-gray-500">Acesso</Text>

          <AppInputController
            leftIcon="mail-outline"
            label="E-MAIL"
            control={control}
            name="email"
            placeholder="mail@example.com.br"
          />

          <AppInputController
            leftIcon="lock-closed-outline"
            label="SENHA"
            control={control}
            name="password"
            secureTextEntry
            placeholder="Sua senha"
          />

          <AppInputController
            leftIcon="lock-closed-outline"
            label="CONFIRMAR SENHA"
            control={control}
            name="confirmPassword"
            secureTextEntry
            placeholder="Confirme a senha"
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
