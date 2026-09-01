import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { buildTeamShieldUri } from '@/lib/api/cardImageUri';
import { getTeamShieldsCount } from '@/lib/api/teamShieldsApi';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const PREVIEW_SIZE = 48;
const SHIELD_ITEM_SIZE = 64;
const SHIELD_ITEM_MARGIN = 8;
const SHIELD_ITEM_WIDTH = SHIELD_ITEM_SIZE + SHIELD_ITEM_MARGIN * 2;
const FADE_WIDTH = 48;
const CENTER_SCALE = 1.12;
const EDGE_SCALE = 0.88;
const LIST_ENTRANCE_MS = 320;

type ShieldListItemProps = {
  id: number;
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  scrollX: SharedValue<number>;
  listWidth: number;
};

function ShieldListItem({
  id,
  index,
  isSelected,
  onSelect,
  scrollX,
  listWidth,
}: ShieldListItemProps) {
  const uri = buildTeamShieldUri(id);

  const animatedStyle = useAnimatedStyle(() => {
    const itemCenterX = index * SHIELD_ITEM_WIDTH + SHIELD_ITEM_WIDTH / 2;
    const visibleCenterX = scrollX.value + listWidth / 2;
    const distance = Math.abs(itemCenterX - visibleCenterX);
    const maxDistance = listWidth * 0.5;
    const t = Math.min(1, distance / maxDistance);
    const scale = EDGE_SCALE + (CENTER_SCALE - EDGE_SCALE) * (1 - t);
    return { transform: [{ scale }] };
  }, [index, listWidth]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
  }, [id, onSelect]);

  return (
    <Animated.View style={[styles.shieldItemWrap, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.shieldItem,
          pressed && styles.shieldItemPressed,
          isSelected && styles.shieldItemSelected,
        ]}
      >
        <Image source={{ uri }} style={styles.shieldItemImage} contentFit="contain" />
      </Pressable>
    </Animated.View>
  );
}

export type TeamShieldPickerProps = {
  /** Campo de nome do time (`TextInput`) — fica à esquerda; escudo à direita na mesma linha. */
  children: ReactNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClear?: () => void;
  disabled?: boolean;
};

/**
 * Linha: nome (children) + escudo com lápis. Lista de escudos abaixo ao abrir (fade + escala no centro).
 */
export function TeamShieldPicker({ children, selectedId, onSelect, onClear, disabled }: TeamShieldPickerProps) {
  const [showShieldPicker, setShowShieldPicker] = useState(false);
  const [shieldsCount, setShieldsCount] = useState(0);
  const [loadingShields, setLoadingShields] = useState(false);
  const [listWidth, setListWidth] = useState(0);

  const scrollX = useSharedValue(0);
  const listWidthSv = useSharedValue(0);
  const shieldCountSv = useSharedValue(0);
  const prevCenterIndexSv = useSharedValue(-1);
  const listEntrance = useSharedValue(0);

  const shieldIds = Array.from({ length: shieldsCount }, (_, i) => i + 1);

  const currentShieldUri =
    selectedId != null && selectedId > 0 ? buildTeamShieldUri(selectedId) : null;

  useEffect(() => {
    if (!showShieldPicker) return;
    let cancelled = false;
    setLoadingShields(true);
    getTeamShieldsCount()
      .then((count) => {
        if (!cancelled) setShieldsCount(count);
      })
      .catch(() => {
        if (!cancelled) setShieldsCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingShields(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showShieldPicker]);

  useEffect(() => {
    shieldCountSv.value = shieldsCount;
  }, [shieldsCount, shieldCountSv]);

  useEffect(() => {
    if (showShieldPicker && shieldsCount > 0) {
      listEntrance.value = 0;
      listEntrance.value = withTiming(1, {
        duration: LIST_ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      listEntrance.value = 0;
    }
  }, [showShieldPicker, shieldsCount, listEntrance]);

  const listEntranceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(listEntrance.value, [0, 1], [0, 1]),
    transform: [{ translateY: interpolate(listEntrance.value, [0, 1], [12, 0]) }],
  }));

  const triggerCenterHaptic = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  const onShieldListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      setListWidth(w);
      listWidthSv.value = w;
    },
    [listWidthSv]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      const listW = listWidthSv.value;
      const count = shieldCountSv.value;
      if (listW <= 0 || count <= 0) return;
      const centerX = e.contentOffset.x + listW / 2 - SHIELD_ITEM_WIDTH / 2;
      const centerIndex = Math.round(centerX / SHIELD_ITEM_WIDTH);
      const clamped = Math.max(0, Math.min(count - 1, centerIndex));
      if (clamped !== prevCenterIndexSv.value) {
        prevCenterIndexSv.value = clamped;
        scheduleOnRN(triggerCenterHaptic);
      }
    },
  });

  const renderShieldItem = useCallback(
    ({ item: id, index }: { item: number; index: number }) => (
      <ShieldListItem
        id={id}
        index={index}
        isSelected={selectedId === id}
        onSelect={onSelect}
        scrollX={scrollX}
        listWidth={listWidth}
      />
    ),
    [selectedId, listWidth, scrollX, onSelect]
  );

  const togglePicker = useCallback(() => {
    if (!disabled) setShowShieldPicker((v) => !v);
  }, [disabled]);

  return (
    <View style={styles.root}>
      <View style={styles.nameRow}>
        <View style={styles.nameInputSlot}>{children}</View>
        <View style={styles.shieldColumn}>
          <View style={styles.previewWrap}>
            <View
              style={[
                styles.previewCircle,
                !currentShieldUri && { backgroundColor: palette.slate[800] },
              ]}
            >
              {currentShieldUri ? (
                <Image source={{ uri: currentShieldUri }} style={styles.previewImage} contentFit="contain" />
              ) : (
                <Ionicons name="shield-outline" size={26} color={colors.textMuted} />
              )}
            </View>
            <Pressable
              onPress={togglePicker}
              disabled={disabled}
              style={({ pressed }) => [
                styles.editFab,
                pressed && !disabled && styles.editFabPressed,
                disabled && styles.editFabDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('team.shieldEditAccessibility')}
            >
              <IconSymbol name="pencil-outline" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {showShieldPicker && (
        <Animated.View style={[styles.listBlock, listEntranceStyle]}>
          {loadingShields ? (
            <View style={styles.listLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : shieldsCount === 0 ? (
            <Text style={styles.listEmpty}>{t('team.shieldNoneOnServer')}</Text>
          ) : (
            <View style={styles.listWrapper} onLayout={onShieldListLayout}>
              <Animated.FlatList
                data={shieldIds}
                keyExtractor={(id) => String(id)}
                renderItem={renderShieldItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SHIELD_ITEM_WIDTH}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                  length: SHIELD_ITEM_WIDTH,
                  offset: SHIELD_ITEM_WIDTH * index,
                  index,
                })}
              />
              {listWidth > 0 && (
                <>
                  <View style={[styles.fade, styles.fadeLeft]} pointerEvents="none">
                    <Canvas style={styles.fadeCanvas}>
                      <Rect x={0} y={0} width={FADE_WIDTH} height={SHIELD_ITEM_SIZE + 32}>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(FADE_WIDTH, 0)}
                          colors={[colors.background, 'transparent']}
                        />
                      </Rect>
                    </Canvas>
                  </View>
                  <View style={[styles.fade, styles.fadeRight]} pointerEvents="none">
                    <Canvas style={styles.fadeCanvas}>
                      <Rect x={0} y={0} width={FADE_WIDTH} height={SHIELD_ITEM_SIZE + 32}>
                        <LinearGradient
                          start={vec(FADE_WIDTH, 0)}
                          end={vec(0, 0)}
                          colors={[colors.background, 'transparent']}
                        />
                      </Rect>
                    </Canvas>
                  </View>
                </>
              )}
            </View>
          )}
          {onClear && selectedId != null && !disabled && (
            <Pressable onPress={onClear} style={styles.clearBtn} hitSlop={8}>
              <Text style={styles.clearBtnText}>{t('team.shieldClear')}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  nameInputSlot: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  shieldColumn: {
    flexShrink: 0,
    width: PREVIEW_SIZE + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWrap: {
    position: 'relative',
    width: PREVIEW_SIZE + 8,
    height: PREVIEW_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCircle: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: palette.slate[900],
  },
  previewImage: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 12,
  },
  editFab: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editFabPressed: {
    opacity: 0.9,
  },
  editFabDisabled: {
    opacity: 0.5,
  },
  listBlock: {
    marginTop: 14,
    marginBottom: 4,
  },
  listLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  listEmpty: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 16,
  },
  listWrapper: {
    position: 'relative',
    height: SHIELD_ITEM_SIZE + 24,
  },
  listContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    zIndex: 1,
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
  fadeCanvas: {
    width: FADE_WIDTH,
    height: SHIELD_ITEM_SIZE + 24,
  },
  shieldItemWrap: {
    width: SHIELD_ITEM_WIDTH,
    height: SHIELD_ITEM_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldItem: {
    width: SHIELD_ITEM_SIZE,
    height: SHIELD_ITEM_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shieldItemPressed: {
    opacity: 0.9,
  },
  shieldItemSelected: {
    borderColor: colors.primary,
  },
  shieldItemImage: {
    width: SHIELD_ITEM_SIZE,
    height: SHIELD_ITEM_SIZE,
    borderRadius: 12,
  },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
