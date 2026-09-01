import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FuelCoinSpendSlider } from '@/components/FuelCoinSpendSlider';
import { t } from '@/i18n';
import {
  coinsForFullRefill,
  DEFAULT_AD_REWARD_COINS_ESTIMATE,
  previewRefillWithMaxSpend,
} from '@/lib/fuelPurchase';
import { colors, palette } from '@/theme';

const coinImage = require('@/assets/coin.png');

/** Parcial: % da capacidade total a comprar (servidor limita ao que falta). Ver FUEL_PURCHASE_MOBILE.md */
export type FuelPurchaseChoice = { kind: 'full' } | { kind: 'budget'; percentToAdd: number };

export type FuelPurchaseModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Zoom do mapa ≥ threshold (modo explorador). */
  explorerModeActive: boolean;
  colyseusConnected: boolean;
  coinBalance: number;
  effectiveFuel: number;
  maxFuel: number;
  coinsPerPercent: number;
  estimatedAdRewardCoins?: number;
  onPurchase: (choice: FuelPurchaseChoice) => void;
  purchaseSending: boolean;
  onWatchAd: () => void;
  watchAdDisabled: boolean;
  watchAdLoading: boolean;
};

export function FuelPurchaseModal({
  visible,
  onClose,
  explorerModeActive,
  colyseusConnected,
  coinBalance,
  effectiveFuel,
  maxFuel,
  coinsPerPercent,
  estimatedAdRewardCoins = DEFAULT_AD_REWARD_COINS_ESTIMATE,
  onPurchase,
  purchaseSending,
  onWatchAd,
  watchAdDisabled,
  watchAdLoading,
}: FuelPurchaseModalProps) {
  const tankFull = effectiveFuel >= maxFuel - 0.01;
  const fullCost = coinsForFullRefill(effectiveFuel, maxFuel, coinsPerPercent);
  const maxSpend = Math.min(coinBalance, fullCost);
  const minSpend = maxSpend >= 1 ? 1 : 0;

  const [spendCoins, setSpendCoins] = useState(minSpend);
  /** Só reinicia o slider ao abrir o modal; `fullCost`/`effectiveFuel` mudam a cada tick do mapa e não podem resetar o valor escolhido. */
  const purchaseModalOpenRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      purchaseModalOpenRef.current = false;
      return;
    }
    const hi = Math.min(coinBalance, fullCost);
    const cap = hi >= 1 ? hi : 0;

    if (!purchaseModalOpenRef.current) {
      setSpendCoins(cap >= 1 ? cap : 0);
      purchaseModalOpenRef.current = true;
      return;
    }

    setSpendCoins((s) => {
      if (cap < 1) return 0;
      return Math.min(Math.max(s, 1), cap);
    });
  }, [visible, coinBalance, fullCost]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const fuelPct =
    maxFuel > 0 ? Math.min(100, Math.max(0, Math.round((effectiveFuel / maxFuel) * 100))) : 0;

  const canPurchaseInRoom = explorerModeActive && colyseusConnected;

  const fullDisabled =
    !canPurchaseInRoom || tankFull || fullCost <= 0 || coinBalance < fullCost || purchaseSending;

  const partialPreview = useMemo(
    () => previewRefillWithMaxSpend(spendCoins, coinsPerPercent, effectiveFuel, maxFuel),
    [spendCoins, coinsPerPercent, effectiveFuel, maxFuel]
  );

  const partialDisabled =
    !canPurchaseInRoom ||
    tankFull ||
    spendCoins < 1 ||
    partialPreview == null ||
    coinBalance < (partialPreview?.coinsSpent ?? 0) ||
    purchaseSending;

  const showExplorerHint = !explorerModeActive;
  const showWaitingRoomHint = explorerModeActive && !colyseusConnected;

  /** Completar o tanque = 1 moeda: slider e “abastecer parcial” são idênticos ao botão de tanque cheio. */
  const showCoinBudgetUi = maxSpend >= 1 && fullCost > 1;

  /**
   * Rewarded: `show()` na mesma cadeia do toque (AdMob). O UI de compra não usa
   * `Modal` nativo — overlay em View — para não competir com a janela do anúncio
   * (evita “fantasma” que bloqueia toques após fechar).
   */
  const onPressWatchVideoFromModal = () => {
    if (watchAdDisabled) return;
    onWatchAd();
    onClose();
  };

  if (!visible) return null;

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
            <Text style={styles.title}>{t('map.fuelPurchaseTitle')}</Text>
            <Text style={styles.zonePrice}>
              {t('map.fuelPurchaseZonePrice', { rate: coinsPerPercent })}
            </Text>

            <View style={styles.statusRow}>
              <Ionicons name="speedometer-outline" size={18} color={colors.textMuted} />
              <Text style={styles.statusText}>{t('map.fuelPurchaseLevel', { percent: fuelPct })}</Text>
            </View>

            {showExplorerHint ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>{t('map.fuelPurchaseNeedConnection')}</Text>
              </View>
            ) : null}

            {showWaitingRoomHint ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>{t('map.fuelPurchaseWaitingRoom')}</Text>
              </View>
            ) : null}

            {canPurchaseInRoom && tankFull ? (
              <View style={styles.hintBoxMuted}>
                <Text style={styles.hintTextMuted}>{t('map.fuelPurchaseTankFull')}</Text>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>{t('map.fuelPurchaseSectionCoins')}</Text>

            {showCoinBudgetUi ? (
              <>
                <FuelCoinSpendSlider
                  min={1}
                  max={maxSpend}
                  value={spendCoins}
                  onValueChange={setSpendCoins}
                  disabled={!canPurchaseInRoom || tankFull || purchaseSending}
                />
                <Text style={styles.sliderSummary}>
                  {partialPreview
                    ? t('map.fuelPurchaseSliderSummary', {
                        coins: partialPreview.coinsSpent,
                        pct: Math.round(partialPreview.percentAdded),
                      })
                    : t('map.fuelPurchaseSliderNoGain')}
                </Text>
                <Pressable
                  onPress={() =>
                    onPurchase({
                      kind: 'budget',
                      percentToAdd: Math.floor(spendCoins / coinsPerPercent),
                    })
                  }
                  disabled={partialDisabled}
                  style={({ pressed }) => [
                    styles.partialBtn,
                    partialDisabled && styles.btnDisabled,
                    pressed && !partialDisabled && styles.btnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: partialDisabled }}>
                  {purchaseSending ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <>
                      <Image source={coinImage} style={styles.coinIcon} contentFit="contain" />
                      <Text style={styles.partialBtnText}>
                        {partialPreview
                          ? t('map.fuelPurchasePaySelected', {
                              coins: partialPreview.coinsSpent,
                              pct: Math.round(partialPreview.percentAdded),
                            })
                          : t('map.fuelPurchasePaySelectedFallback', { coins: spendCoins })}
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : null}

            <Pressable
              onPress={() => onPurchase({ kind: 'full' })}
              disabled={fullDisabled}
              style={({ pressed }) => [
                styles.primaryBtn,
                fullDisabled && styles.btnDisabled,
                pressed && !fullDisabled && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: fullDisabled }}>
              {purchaseSending ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                  <Image source={coinImage} style={styles.coinIcon} contentFit="contain" />
                  <Text style={styles.primaryBtnText}>
                    {t('map.fuelPurchaseFullTank', { cost: fullCost })}
                  </Text>
                </>
              )}
            </Pressable>

            {canPurchaseInRoom && !tankFull && fullCost > 0 && coinBalance < fullCost ? (
              <Text style={styles.balanceNote}>{t('map.fuelPurchaseInsufficientFull')}</Text>
            ) : null}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('map.fuelPurchaseOr')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={onPressWatchVideoFromModal}
              disabled={watchAdDisabled}
              style={({ pressed }) => [
                styles.secondaryBtn,
                watchAdDisabled && styles.btnDisabled,
                pressed && !watchAdDisabled && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: watchAdDisabled }}>
              {watchAdLoading ? (
                <ActivityIndicator color={palette.amber[400]} size="small" />
              ) : (
                <>
                  <Ionicons name="play-circle-outline" size={22} color={palette.amber[400]} />
                  <Text style={styles.secondaryBtnText}>{t('map.fuelPurchaseWatchAd')}</Text>
                </>
              )}
            </Pressable>
            <View style={styles.adBalanceRow}>
              <Image source={coinImage} style={styles.adBalanceCoin} contentFit="contain" />
              <Text style={styles.adBalanceText}>
                {t('map.fuelPurchaseModalAdBalance', { balance: coinBalance })}
              </Text>
            </View>
            <Text style={styles.adHint}>
              {t('map.fuelPurchaseAdExplainer', { coins: estimatedAdRewardCoins })}
            </Text>
            <Text style={styles.adHintSecondary}>{t('map.fuelPurchaseAdNotFullTank')}</Text>

            <Pressable style={styles.closeLink} onPress={onClose} accessibilityRole="button">
              <Text style={styles.closeLinkText}>{t('common.close')}</Text>
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
    zIndex: 5000,
    elevation: 50,
  },
  backdropAbs: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardColumn: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    pointerEvents: 'box-none',
  },
  cardOuter: {
    backgroundColor: colors.hudCardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashboardBorder,
    maxWidth: 340,
    width: '100%',
    maxHeight: '88%',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  zonePrice: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  sliderSummary: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  hintBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  hintText: {
    fontSize: 13,
    color: colors.primaryLight,
    lineHeight: 18,
  },
  hintBoxMuted: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  hintTextMuted: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  partialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    marginBottom: 10,
  },
  partialBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'center',
  },
  coinIcon: {
    width: 22,
    height: 22,
  },
  balanceNote: {
    fontSize: 12,
    color: colors.destructiveLight,
    marginTop: 8,
    textAlign: 'center',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    opacity: 0.88,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    minHeight: 48,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.amber[400],
  },
  adBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  adBalanceCoin: {
    width: 20,
    height: 20,
  },
  adBalanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  adHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
  },
  adHintSecondary: {
    fontSize: 11,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  closeLink: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryLight,
  },
});
