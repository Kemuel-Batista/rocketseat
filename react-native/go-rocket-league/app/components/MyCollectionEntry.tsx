import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, palette } from '@/theme';
import { t } from '@/i18n';

export interface MyCollectionEntryProps {
  /** Collected cards count */
  collected: number;
  onPress?: () => void;
}

export function MyCollectionEntry({
  collected,
  onPress,
}: MyCollectionEntryProps) {
  const formattedCollected = collected.toLocaleString();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityLabel={t('collection.myCollection')}
      accessibilityHint={t('collection.openMyCollectionHint')}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="layers-outline" size={28} color={colors.primaryLight} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{t('collection.myCollection')}</Text>
        <Text style={styles.subtitle}>
          {t('collection.entrySubtitle', { countFormatted: formattedCollected })}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.slate[800],
    borderRadius: 20,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  chevron: {
    marginLeft: 8,
  },
});
