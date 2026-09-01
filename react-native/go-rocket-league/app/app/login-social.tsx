import React, { useEffect } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { SocialButton } from '@/components/onboarding/SocialButton';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { colors } from '@/theme';

export default function LoginSocialScreen() {
  const { startGoogleLogin, isLoading, error, hasLinked } = useGoogleLogin({
    onSuccess: () => {
      Alert.alert('Conta vinculada', 'Sua conta Google foi vinculada com sucesso.');
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Erro ao vincular conta', error.message);
    }
  }, [error]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Conecte sua conta</Text>
        <Text style={styles.subtitle}>
          Vincule sua conta Google ao seu usuário convidado para salvar seu progresso.
        </Text>

        <View style={styles.buttonWrapper}>
          <SocialButton
            label="Continue with Google"
            onPress={() => {
              if (!isLoading && !hasLinked) {
                void startGoogleLogin();
              }
            }}
            icon={
              <Image
                source={{
                  uri: 'https://developers.google.com/identity/images/g-logo.png',
                }}
                style={styles.googleIcon}
              />
            }
          />
        </View>

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Conectando com o Google...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
  },
  googleIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

