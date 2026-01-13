import { AppInput } from '@/shared/components/app-input'
import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLoginViewModel } from './use-login.view-model'
import { AppInputController } from '@/shared/components/app-input-controller'

export function LoginView({ control }: ReturnType<typeof useLoginViewModel>) {
  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <View className="flex-1 items-center justify-center px-10">
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
          />

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text>Registro</Text>
          </TouchableOpacity>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
