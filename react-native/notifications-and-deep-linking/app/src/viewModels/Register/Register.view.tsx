import { FC, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRegisterViewModel } from "./useRegister.viewModel";
import { AppInputController } from "../../shared/components/AppInputController";
import { AuthFormHeader } from "../../shared/components/AuthFormHeader";
import { router } from "expo-router";
import { KeyboardContainer } from "../../shared/components/KeyboardContainer";
import { AppButton } from "../../shared/components/AppButton";
import { Ionicons } from "@expo/vector-icons";

export const RegisterView: FC<ReturnType<typeof useRegisterViewModel>> = ({
  onSubmit,
  control,
  handleSelectAvatar,
  avatarUri,
}) => {
  return (
    <KeyboardContainer>
      <ScrollView className="flex-1 px-[40px]">
        <AuthFormHeader
          title="Crie sua conta"
          subTitle="Informe os seus dados pessoais e de acesso"
        />
        <TouchableOpacity
          className="w-[120px] h-[120px] rounded-[12px] items-center justify-center bg-shape self-center mb-8"
          onPress={handleSelectAvatar}
        >
          {avatarUri ? (
            <Image
              className="w-full h-full rounded-[12px]"
              source={{ uri: avatarUri }}
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

        <Text className="text-base mt-6 font-bold text-gray-500">Acesso</Text>

        <AppInputController
          leftIcon="mail-outline"
          label="E-MAIL"
          control={control}
          name="email"
          placeholder="mail@exemple.com.br"
        />

        <AppInputController
          leftIcon="lock-closed-outline"
          label="SENHA"
          control={control}
          name="password"
          placeholder="Sua senha"
          secureTextEntry
        />

        <AppInputController
          leftIcon="lock-closed-outline"
          label="CONFIRMAR SENHA"
          control={control}
          name="confirmPassword"
          secureTextEntry
          placeholder="Confirme a senha"
        />

        <AppButton className="mt-6" onPress={onSubmit}>
          Registrar
        </AppButton>

        <View className="mt-16">
          <Text className="text-base text-gray-300 mb-6">
            Já tem uma conta?
          </Text>
          <AppButton
            variant="outlined"
            onPress={() => router.push("/(public)/login")}
          >
            Login
          </AppButton>
        </View>
      </ScrollView>
    </KeyboardContainer>
  );
};
