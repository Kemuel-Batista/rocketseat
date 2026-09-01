import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';
import { t } from '@/i18n';
import { getFlagEmojiForCountry } from '@/assets/flags';

const ROW_GAP = 12;
const ENTRANCE_OFFSET = 20;
const STAGGER_MS = 50;
const DURATION_MS = 280;

export interface SelectionListProps {
  /** List of selection names (e.g. from API). For demo, derived from cards. */
  selections: string[];
  onSelectionPress: (selectionName: string) => void;
  /** Change to re-run entrance animation */
  focusKey?: number;
}

function SelectionRow({
  name,
  index,
  onPress,
  focusKey,
}: {
  name: string;
  index: number;
  onPress: () => void;
  focusKey?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      index * STAGGER_MS,
      withTiming(1, { duration: DURATION_MS, easing: Easing.out(Easing.cubic) })
    );
  }, [index, focusKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * ENTRANCE_OFFSET }],
  }));

  const flagEmoji = getFlagEmojiForCountry(name);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('cards.openSelection', { name })}
      >
        <View style={styles.iconWrap}>
          {flagEmoji ? (
            <Text style={styles.flagText}>{flagEmoji}</Text>
          ) : (
            <Ionicons name="globe-outline" size={24} color={colors.primaryLight} />
          )}
        </View>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {name}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export function SelectionList({
  selections,
  onSelectionPress,
  focusKey,
}: SelectionListProps) {
  const sorted = [...selections].sort((a, b) => a.localeCompare(b));

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="globe-outline" size={48} color={colors.cardBorderSubtle} />
        <Text style={styles.emptyTitle}>{t('cards.selectionEmptyTitle')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('cards.selectionEmptySubtitle')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sorted.map((name, index) => (
        <SelectionRow
          key={name}
          name={name}
          index={index}
          focusKey={focusKey}
          onPress={() => onSelectionPress(name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: ROW_GAP,
    paddingBottom: ROW_GAP,
    paddingTop: ROW_GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rowPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    // backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flagText: {
    fontSize: 30,
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    minWidth: 0,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
