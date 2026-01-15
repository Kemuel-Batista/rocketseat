import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useRegisterViewModel } from './use-register.view-model'
import { AppInputController } from '@/shared/components/app-input-controller'
import { AuthFormHeader } from '@/shared/components/auth-form-header'
import { router } from 'expo-router'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppButton } from '@/shared/components/app-button'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export function RegisterView({
  control,
  onSubmit,
  avatarUri,
  handleSelectAvatar,
}: ReturnType<typeof useRegisterViewModel>) {
  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <ScrollView className="flex-1 px-[40px]">
          <AuthFormHeader
            title="Crie sua conta"
            subTitle="Informe os seus dados pessoais e de acesso"
          />

          <TouchableOpacity
            className="mb-8 h-[120px] w-[120px] items-center justify-center self-center rounded-xl bg-shape"
            onPress={handleSelectAvatar}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="h-full w-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cloud-upload-outline" size={32} />
            )}
          </TouchableOpacity>

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

          <AppButton
            title="Registrar"
            className="mt-6"
            rightIcon="arrow-forward"
            onPress={onSubmit}
          />

          <View className="mt-16">
            <Text className="my-6 text-base text-gray-300">
              Ainda não tem uma conta?
            </Text>

            <AppButton
              title="Login"
              variant="outlined"
              rightIcon="arrow-forward"
              onPress={() => router.push('/(public)/login')}
            />
          </View>
        </ScrollView>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
