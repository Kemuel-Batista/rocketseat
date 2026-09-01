import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type NoSessionScreenProps = {
  onRetry: () => void;
  retrying?: boolean;
};

export function NoSessionScreen({ onRetry, retrying = false }: NoSessionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 }]}>
      <Text style={styles.title}>Sem conexão</Text>
      <Text style={styles.message}>
        Não conseguimos criar uma sessão. Verifique sua internet e tente novamente.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, retrying && styles.buttonDisabled]}
        onPress={onRetry}
        disabled={retrying}
      >
        <Text style={[styles.buttonText, retrying && styles.buttonTextDisabled]}>
          {retrying ? 'Tentando...' : 'Tentar novamente'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});
