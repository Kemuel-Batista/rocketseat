import { AppInput } from '@/shared/components/app-input'
import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function LoginView() {
  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <View className="flex-1 items-center justify-center px-10">
          <AuthFormHeader
            subTitle="Informe seu e-mail e senha"
            title="Acesse sua conta"
          />

          <AppInput />

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text>Registro</Text>
          </TouchableOpacity>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
