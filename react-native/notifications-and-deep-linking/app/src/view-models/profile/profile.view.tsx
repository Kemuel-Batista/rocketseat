import { Image, ScrollView, Text, TouchableOpacity } from 'react-native'
import { useProfileViewModel } from './use-profile.view-model'
import { Ionicons } from '@expo/vector-icons'
import { AppInputController } from '@/shared/components/app-input-controller'
import { AppButton } from '@/shared/components/app-button'
import { DismissKeyboardView } from '@/shared/components/dismiss-keyboard-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Header } from './components/header'
import React from 'react'

export function ProfileView({
  control,
  onSubmit,
  avatarUri,
  isSubmitting,
  handleLogout,
  handleSelectImage,
}: ReturnType<typeof useProfileViewModel>) {
  return (
    <SafeAreaView className="flex-1">
      <DismissKeyboardView>
        <ScrollView className="flex-1 px-[40px]">
          <Header onLogout={handleLogout} />
          <TouchableOpacity
            onPress={handleSelectImage}
            className="mb-8 mt-6 h-[120px] w-[120px] items-center justify-center self-center rounded-xl bg-shape"
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
          <Text className="mt-6 text-base font-bold text-gray-500">
            Dados pessoais
          </Text>

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
            label="SENHA ATUAL"
            control={control}
            name="password"
            placeholder="Sua senha"
            secureTextEntry
          />

          <AppInputController
            leftIcon="lock-closed-outline"
            label="NOVA SENHA"
            control={control}
            name="newPassword"
            placeholder="Sua nova senha"
            secureTextEntry
          />

          <AppButton
            title="Atualizar cadastro"
            className="mt-6"
            onPress={onSubmit}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </DismissKeyboardView>
    </SafeAreaView>
  )
}
