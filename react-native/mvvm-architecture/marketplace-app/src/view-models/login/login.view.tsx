import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLoginViewModel } from './use-login.view-model'
import { AppInputController } from '@/shared/components/app-input-controller'
import { AppButton } from '@/shared/components/app-button'

export function LoginView({
  control,
  onSubmit,
}: ReturnType<typeof useLoginViewModel>) {
  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-full flex-1 items-center justify-center">
            <AuthFormHeader
              subTitle="Informe seu e-mail e senha"
              title="Acesse sua conta"
            />

            <AppInputController
              control={control}
              name="email"
              label="E-MAIL"
              leftIcon="mail-outline"
              placeholder="mail@example.com.br"
            />

            <AppInputController
              control={control}
              name="password"
              label="SENHA"
              leftIcon="lock-closed-outline"
              placeholder="Sua senha"
              secureTextEntry
            />

            <AppButton
              title="Login"
              className="mt-6"
              rightIcon="arrow-forward"
              onPress={onSubmit}
            />
          </View>

          <View className="flex-2 pb-16">
            <Text className="mb-6 text-base text-gray-300">
              Já tem uma conta?
            </Text>

            <AppButton
              title="Registro"
              variant="outlined"
              rightIcon="arrow-forward"
              onPress={() => router.push('/register')}
            />
          </View>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
