import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CardReveal } from '@/components/CardReveal';
import { getPackCardDisplayInfo } from '@/lib/cards/packCardDisplay';
import type { CardsPackGrantedPayload } from '@/lib/colyseus/types';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

export type CardsPackModalProps = {
  visible: boolean;
  pack: CardsPackGrantedPayload | null;
  onClose: () => void;
};

export function CardsPackModal({ visible, pack, onClose }: CardsPackModalProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const cards = pack?.cards ?? [];
  const total = cards.length;
  const current = cards[index];

  useEffect(() => {
    if (!visible || !pack) return;
    setIndex(0);
    setRevealed(false);
  }, [visible, pack]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const title = useMemo(() => {
    if (!pack) return '';
    if (pack.type === 'initial') return t('cards.pack.titleInitial');
    if (pack.type === 'daily') return t('cards.pack.titleDaily');
    return t('cards.pack.titleMapPickup');
  }, [pack]);

  const display = useMemo(() => (current ? getPackCardDisplayInfo(current) : null), [current]);

  const onPrimary = useCallback(() => {
    if (!current || !display) return;
    if (!revealed) {
      setRevealed(true);
      return;
    }
    if (index < total - 1) {
      // Mesmo ciclo que o novo índice: evita um frame com carta nova + revealed=true (flash da frente).
      setRevealed(false);
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [current, display, revealed, index, total, onClose]);

  if (!visible || !pack || total === 0 || !current || !display) {
    return null;
  }

  const isLast = index >= total - 1;
  const primaryLabel = !revealed
    ? t('cards.pack.revealAction')
    : isLast
      ? t('cards.pack.done')
      : t('cards.pack.nextCard');

  const compact = total >= 5;

  return (
    <View style={styles.overlayRoot} accessibilityViewIsModal importantForAccessibility="yes">
      <Pressable
        style={styles.backdropAbs}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
      />
      <View style={styles.cardColumn} pointerEvents="box-none">
        <Pressable style={styles.cardOuter} onPress={(e) => e.stopPropagation()}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                  {t('cards.pack.progress', { current: index + 1, total })}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.dotsRow}>
              {cards.map((c, i) => (
                <View
                  key={c.id}
                  style={[
                    styles.dot,
                    i === index && styles.dotActive,
                    i < index && styles.dotDone,
                  ]}
                />
              ))}
            </View>

            <CardReveal
              key={current.id}
              card={current}
              display={display}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              compact={compact}
            />

            {!revealed ? (
              <Text style={styles.helper}>{t('cards.pack.helperTapCard')}</Text>
            ) : (
              <Text style={styles.helperMuted}>{t('cards.pack.helperContinue')}</Text>
            )}

            <Pressable
              onPress={onPrimary}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.primaryBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}>
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </Pressable>
          </ScrollView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5001,
    elevation: 51,
  },
  backdropAbs: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  cardColumn: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.dashboardBorder,
    overflow: 'hidden',
    shadowColor: palette.cyan[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: colors.hudCardBackground,
  },
  closeBtnPressed: {
    opacity: 0.85,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  dotDone: {
    backgroundColor: colors.primaryLight,
    opacity: 0.5,
  },
  helper: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  helperMuted: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  primaryBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 22,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.45)',
  },
  primaryBtnPressed: {
    opacity: 0.88,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
});
