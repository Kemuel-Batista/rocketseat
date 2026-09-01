import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { colors } from '@/theme';

export interface ProfileStatCardProps {
  backgroundColor: string;
  iconColor: string;
  icon: IconSymbolName;
  value: string;
  label: string;
}

export function ProfileStatCard({
  backgroundColor,
  iconColor,
  icon,
  value,
  label,
}: ProfileStatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <IconSymbol name={icon} size={20} color={iconColor} style={styles.icon} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
