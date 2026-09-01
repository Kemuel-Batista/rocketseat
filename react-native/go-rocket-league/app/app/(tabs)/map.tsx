import { memo, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { FuelIndicatorCircular } from '@/components/FuelIndicatorCircular';
import { CardsPackModal } from '@/components/CardsPackModal';
import { FuelPurchaseModal, type FuelPurchaseChoice } from '@/components/FuelPurchaseModal';
import { MapDashboard } from '@/components/MapDashboard';
import { MapGradientOverlay } from '@/components/MapGradientOverlay';
import { MapGridOverlay } from '@/components/MapGridOverlay';
import { type MapRegion } from '@/components/MapH3CellsOverlay';
import { SelfAvatarMarker, SELF_MAP_AVATAR_SIZE } from '@/components/SelfAvatarMarker';
import { XpLevelIndicator } from '@/components/XpLevelIndicator';
import { useToast } from '@/components/toast/ToastContainer';
import { useCoverage } from '@/lib/coverage/useCoverage';
import type { RoomFuelEconomy } from '@/lib/colyseus/types';
import { useCellRoom } from '@/lib/colyseus/useCellRoom';
import { DEFAULT_FUEL_PURCHASE_COINS_PER_PERCENT } from '@/lib/fuelPurchase';
import { useMapRewardedAd } from '@/lib/admob/useMapRewardedAd';
import { apiConfig } from '@/lib/api/config';
import { useUserStore } from '@/store/userStore';
import { t } from '@/i18n';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import {
  colors,
  customMapStyle,
  defaultMapRegion,
  EXPLORER_ZOOM_THRESHOLD,
  getZoomFromRegion,
  palette,
} from '@/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Image } from 'expo-image';

const coinMarkerImage = require('@/assets/coin.png');
const coinMarkerSpriteImage = require('@/assets/coin.png');
/** Metade carta / metade transparente — mesmo truque de sprite que `coin-marker.png`. */
const cardMarkerSpriteImage = require('@/assets/card.png');
const flagMarkerImage = require('@/assets/flag.png');
const CAPTURE_SOUND_FILE = require('../../assets/sounds/fx.mp3');

// Coordenadas do centro do mapa (nunca usar localização física do aparelho para Colyseus).
const INITIAL_LAT: number = defaultMapRegion.latitude;
const INITIAL_LNG: number = defaultMapRegion.longitude;

const COIN_DOT_COLOR = '#facc15';
const FLAG_DOT_COLOR = '#22c55e';
const OTHER_PLAYER_AVATAR_SIZE = SELF_MAP_AVATAR_SIZE;
const OTHER_PLAYER_AVATAR_BORDER = 2;
const OTHER_PLAYER_AVATAR_OUTER = OTHER_PLAYER_AVATAR_SIZE + OTHER_PLAYER_AVATAR_BORDER * 2;
const COIN_MARKER_SIZE = 10;
const FLAG_MARKER_SIZE = 16;
const COIN_SPRITE_FRAME_SIZE = 20;
const COIN_SLOT_COUNT = 20;
const MAX_ACTIVE_COINS = 15;
const CARD_SPRITE_FRAME_SIZE = 36;
const CARD_SLOT_COUNT = 5;
const MAX_ACTIVE_CARDS = 5;
const OTHER_USER_MARKER_POOL_SIZE = 10;

const EARTH_RADIUS_KM = 6371; // usado para distância em km no dashboard

type OtherUserAvatarMarkerProps = {
  avatarId: string | null | undefined;
};
const OtherUserAvatarMarker = memo(function OtherUserAvatarMarker({ avatarId }: OtherUserAvatarMarkerProps) {
  const hasAvatar = !!avatarId && String(avatarId).trim() !== '' && String(avatarId) !== '0';
  const uri = `${apiConfig.baseUrl}/public_assets/avatars/${hasAvatar ? String(avatarId) : '1'}.webp`;

  return (
    <View style={styles.otherUserAvatarWrap} collapsable={false}>
      <View style={styles.otherUserAvatarClip}>
        <Image
          source={{ uri }}
          style={styles.otherUserAvatarImage}
          contentFit="cover"
        />
      </View>
    </View>
  );
});

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function getEffectiveFuel(
  fuel: number,
  fuelRuntime: {
    maxFuel: number;
    refillInterval: number;
    lastRefillAt: number;
    lastFuelUpdateAt: number;
    refillActive: boolean;
    refillGranted: number;
  } | null,
  nowMs: number
): number {
  if (!fuelRuntime || !fuelRuntime.refillActive) return fuel;
  const maxFuel = Math.max(0, fuelRuntime.maxFuel);
  const interval = Math.max(1, fuelRuntime.refillInterval);
  const baseGranted = Math.max(0, fuelRuntime.refillGranted);
  const elapsedMs = Math.max(0, nowMs - fuelRuntime.lastFuelUpdateAt);
  const grantRatePerMs = maxFuel / interval;
  const grantedNow = Math.min(maxFuel, baseGranted + elapsedMs * grantRatePerMs);
  const additionalGranted = Math.max(0, grantedNow - baseGranted);
  return Math.min(maxFuel, Math.max(0, fuel) + additionalGranted);
}

function fuelPurchaseRejectMessage(reason: string): string {
  const key = `map.fuelPurchaseReject.${reason}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return t('map.fuelPurchaseReject.server_error');
}

type CoinSlotState = {
  coinId: string | null;
  lat: number;
  lng: number;
  visible: boolean;
};

function buildInitialCoinSlots(baseLat: number, baseLng: number): CoinSlotState[] {
  return Array.from({ length: COIN_SLOT_COUNT }, (_, index) => ({
    coinId: null,
    lat: baseLat + (index + 1) * 0.00001,
    lng: baseLng - (index + 1) * 0.00001,
    visible: false,
  }));
}

type CardSlotState = {
  cardId: string | null;
  lat: number;
  lng: number;
  visible: boolean;
};

function buildInitialCardSlots(baseLat: number, baseLng: number): CardSlotState[] {
  return Array.from({ length: CARD_SLOT_COUNT }, (_, index) => ({
    cardId: null,
    lat: baseLat - (index + 1) * 0.00001,
    lng: baseLng + (index + 1) * 0.00001,
    visible: false,
  }));
}

type OtherUserSlotState = {
  id: string;
  avatarId: string;
  lat: number;
  lng: number;
  visible: boolean;
};

function buildInitialOtherUserSlots(baseLat: number, baseLng: number): OtherUserSlotState[] {
  return Array.from({ length: OTHER_USER_MARKER_POOL_SIZE }, (_, index) => ({
    id: `slot-${index}`,
    avatarId: '1',
    lat: baseLat + (index + 1) * 0.000005,
    lng: baseLng + (index + 1) * 0.000005,
    visible: false,
  }));
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const fuel = useUserStore((s) => s.fuel);
  const fuelRuntime = useUserStore((s) => s.fuelRuntime);
  const xp = useUserStore((s) => s.xp);
  const level = useUserStore((s) => s.level);
  const flagsOwned = useUserStore((s) => s.flagsOwned);
  const ownedAreaKm2 = useUserStore((s) => s.ownedAreaKm2);
  const coinBalance = useUserStore((s) => s.coinBalance);
  const userId = useUserStore((s) => s.userId);
  const username = useUserStore((s) => s.username);
  const avatarId = useUserStore((s) => s.avatarId);
  const setNearbyUsers = useUserStore((s) => s.setNearbyUsers);
  const [isScanning, setIsScanning] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const lastDistanceLatLngRef = useRef<{ lat: number; lng: number } | null>(null);
  const [cardsDiscovered, setCardsDiscovered] = useState(4);
  const [focusKey, setFocusKey] = useState(0);
  const [showExplorerInfoPopup, setShowExplorerInfoPopup] = useState(false);
  const [showFuelPurchaseModal, setShowFuelPurchaseModal] = useState(false);
  const [fuelPurchaseSending, setFuelPurchaseSending] = useState(false);
  const fuelPurchasePendingRef = useRef(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const regionRef = useRef<MapRegion>(defaultMapRegion);
  // Posição do jogador usada para join/update e para render do marcador "self".
  const [playerPosition, setPlayerPosition] = useState<{ lat: number; lng: number }>({
    lat: INITIAL_LAT,
    lng: INITIAL_LNG,
  });
  // Região completa (com deltas) para o overlay de células H3 RES 8.
  const [mapRegion, setMapRegion] = useState<MapRegion>({ ...defaultMapRegion });

  const {
    connected,
    error: roomError,
    otherUsers,
    flag,
    lastFlagCaptured,
    coins,
    cards,
    lastRoomCoinGranted,
    lastCollectCoinRejected,
    lastAdRewardGranted,
    lastAdRewardRejected,
    roomName,
    connect,
    leave,
    sendUpdatePosition,
    sendClaimAdReward,
    sendPurchaseFuel,
    lastFuelPurchaseGranted,
    lastFuelPurchaseRejected,
    fuelEconomy,
    cardsPackPending,
    ackFuelPurchaseFeedback,
    ackAdRewardFeedback,
    ackCardsPackFeedback,
  } = useCellRoom(playerPosition.lat, playerPosition.lng, {
    userId,
    username,
    avatarId,
    level,
    xp,
    fuel,
  });

  const { showCta: showRewardedAdCta, ctaDisabled: rewardedAdCtaDisabled, ctaLoading: rewardedAdLoading, onPressWatchAd } =
    useMapRewardedAd({
      colyseusConnected: connected,
      sendClaimAdReward,
      lastAdRewardGranted,
      lastAdRewardRejected,
      ackAdRewardFeedback,
    });

  const { coverageCount, addVisitedCell } = useCoverage();

  const onOpenFuelPurchase = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFuelPurchaseModal(true);
  }, []);

  const fuelPurchaseEconomyResolved = useMemo((): RoomFuelEconomy => {
    if (fuelEconomy) return fuelEconomy;
    return {
      fuelPurchaseCoinsPerPercent: DEFAULT_FUEL_PURCHASE_COINS_PER_PERCENT,
      maxFuel: fuelRuntime.maxFuel,
    };
  }, [fuelEconomy, fuelRuntime.maxFuel]);

  const onPurchaseFuel = useCallback(
    (choice: FuelPurchaseChoice) => {
      if (!connected) return;
      fuelPurchasePendingRef.current = true;
      setFuelPurchaseSending(true);
      if (choice.kind === 'full') {
        sendPurchaseFuel();
      } else {
        sendPurchaseFuel({ percentToAdd: choice.percentToAdd });
      }
    },
    [connected, sendPurchaseFuel]
  );

  useEffect(() => {
    const g = lastFuelPurchaseGranted;
    if (!g) return;
    if (!fuelPurchasePendingRef.current) {
      ackFuelPurchaseFeedback();
      return;
    }
    fuelPurchasePendingRef.current = false;
    setFuelPurchaseSending(false);
    const balance = Number(g.balance);
    const spent = Number(g.coinsSpent);
    const showBalance = Number.isFinite(balance) ? balance : useUserStore.getState().coinBalance;
    const showSpent = Number.isFinite(spent) ? spent : 0;
    toast.showSuccess(
      g.duplicate
        ? t('map.fuelPurchaseSuccessDuplicate', { balance: showBalance })
        : t('map.fuelPurchaseSuccess', {
            balance: showBalance,
            spent: showSpent,
          }),
      { title: t('map.fuelPurchaseTitle') },
    );
    ackFuelPurchaseFeedback();
    setShowFuelPurchaseModal(false);
  }, [lastFuelPurchaseGranted, ackFuelPurchaseFeedback, toast]);

  useEffect(() => {
    const r = lastFuelPurchaseRejected;
    if (!r || !fuelPurchasePendingRef.current) return;
    fuelPurchasePendingRef.current = false;
    setFuelPurchaseSending(false);
    toast.showError(fuelPurchaseRejectMessage(String(r.reason ?? 'server_error')), {
      title: t('map.fuelPurchaseTitle'),
    });
    ackFuelPurchaseFeedback();
  }, [lastFuelPurchaseRejected, ackFuelPurchaseFeedback, toast]);

  useEffect(() => {
    if (!connected && fuelPurchaseSending) {
      setFuelPurchaseSending(false);
      fuelPurchasePendingRef.current = false;
    }
  }, [connected, fuelPurchaseSending]);

  useEffect(() => {
    if (!cardsPackPending || cardsPackPending.type !== 'map_pickup') return;
    const cardId = cardsPackPending.cards[0]?.id;
    if (!cardId) return;
    if (lastMapPickupToastCardIdRef.current === cardId) return;
    lastMapPickupToastCardIdRef.current = cardId;
    toast.showSuccess(t('map.cardCollectedMessage'));
  }, [cardsPackPending, toast, t]);

  const effectiveFuel = getEffectiveFuel(fuel, fuelRuntime, nowMs);
  const currentZoom = getZoomFromRegion(mapRegion.longitudeDelta);
  const explorerModeActive = currentZoom >= EXPLORER_ZOOM_THRESHOLD;
  const explorerGameplayActive = explorerModeActive && effectiveFuel > 0;
  const selfRoomState = useMemo(() => ({ flag }), [flag]);
  const keepSelfTrackingForRadar = !!flag && !flag.isCaptured;

  // Só conecta no Colyseus com modo explorador ativo (zoom >= threshold).
  useEffect(() => {
    if (userId == null) return;
    if (!explorerModeActive) return;
    connect(playerPosition.lat, playerPosition.lng);
    return () => leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- connect/leave are stable
  }, [userId, explorerModeActive]);

  // Registra a célula atual como visitada só no modo explorador (zoom >= threshold).
  useEffect(() => {
    if (!explorerGameplayActive || !roomName) return;
    const cellId = roomName.replace(/^cell:/, '');
    if (cellId) addVisitedCell(cellId);
  }, [explorerGameplayActive, roomName, addVisitedCell]);

  const lastCoinGrantedRef = useRef<string | null>(null);
  const lastCoinRejectRef = useRef<string | null>(null);
  const lastFlagCapturedRef = useRef<string | null>(null);
  const lastMapPickupToastCardIdRef = useRef<string | null>(null);
  const coinSoundRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const flagSoundRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const playFeedbackAsync = useCallback(
    async (
      soundRef: MutableRefObject<ReturnType<typeof createAudioPlayer> | null>,
      hapticStyle:
        | Haptics.ImpactFeedbackStyle
        | Haptics.NotificationFeedbackType,
      isNotification = false
    ) => {
      try {
        if (isNotification) {
          await Haptics.notificationAsync(
            hapticStyle as Haptics.NotificationFeedbackType
          );
        } else {
          await Haptics.impactAsync(hapticStyle as Haptics.ImpactFeedbackStyle);
        }
      } catch {}

      try {
        const sound = soundRef.current;
        if (!sound) return;
        await sound.seekTo(0);
        sound.play();
      } catch {}
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
        const coinSound = createAudioPlayer(CAPTURE_SOUND_FILE);
        coinSound.volume = 0.7;
        const flagSound = createAudioPlayer(CAPTURE_SOUND_FILE);
        flagSound.volume = 0.85;
        if (!mounted) {
          coinSound.remove();
          flagSound.remove();
          return;
        }
        coinSoundRef.current = coinSound;
        flagSoundRef.current = flagSound;
      } catch {}
    })();

    return () => {
      mounted = false;
      coinSoundRef.current?.remove();
      flagSoundRef.current?.remove();
      coinSoundRef.current = null;
      flagSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lastRoomCoinGranted || lastRoomCoinGranted.duplicate) return;
    const dedupeKey = `${lastRoomCoinGranted.coinId}:${lastRoomCoinGranted.balance}:${lastRoomCoinGranted.value}`;
    if (lastCoinGrantedRef.current === dedupeKey) return;
    lastCoinGrantedRef.current = dedupeKey;
    void playFeedbackAsync(coinSoundRef, Haptics.ImpactFeedbackStyle.Medium);
  }, [lastRoomCoinGranted, playFeedbackAsync]);

  useEffect(() => {
    if (!lastCollectCoinRejected) return;
    const dedupeKey = `${lastCollectCoinRejected.coinId}:${lastCollectCoinRejected.reason}`;
    if (lastCoinRejectRef.current === dedupeKey) return;
    lastCoinRejectRef.current = dedupeKey;

    const r = lastCollectCoinRejected.reason;
    let resolved: string;
    switch (r) {
      case 'no_user':
        resolved = t('map.coinReject.no_user');
        break;
      case 'not_found':
        resolved = t('map.coinReject.not_found');
        break;
      case 'too_far':
        resolved = t('map.coinReject.too_far');
        break;
      case 'invalid_coordinates':
        resolved = t('map.coinReject.invalid_coordinates');
        break;
      case 'rate_limited':
        resolved = t('map.coinReject.rate_limited');
        break;
      case 'ledger_error':
        resolved = t('map.coinReject.ledger_error');
        break;
      default:
        resolved = t('map.coinReject.unknown');
    }

    toast.showError(resolved, { title: t('map.coinCollectRejectedTitle') });
  }, [lastCollectCoinRejected, toast]);

  useEffect(() => {
    if (!lastFlagCaptured) return;
    const dedupeKey = `${lastFlagCaptured.h3RoomCell}:${lastFlagCaptured.capturedByUserId}:${lastFlagCaptured.ownerUserId}`;
    if (lastFlagCapturedRef.current === dedupeKey) return;
    lastFlagCapturedRef.current = dedupeKey;

    const isMine = String(lastFlagCaptured.ownerUserId) === String(userId ?? '');
    const isCapturedByMe = String(lastFlagCaptured.capturedByUserId) === String(userId ?? '');

    if (isCapturedByMe) {
      toast.showSuccess(t('map.flagCapturedByMeMessage'), {
        title: t('map.flagCapturedTitle'),
      });
      void playFeedbackAsync(
        flagSoundRef,
        Haptics.NotificationFeedbackType.Success,
        true
      );
      return;
    }

    if (isMine) {
      toast.showError(t('map.flagLostMessage'), {
        title: t('map.flagCapturedTitle'),
      });
      void playFeedbackAsync(
        flagSoundRef,
        Haptics.NotificationFeedbackType.Warning,
        true
      );
      return;
    }

    toast.showSuccess(t('map.flagCapturedOtherMessage'), {
      title: t('map.flagCapturedTitle'),
    });
    void playFeedbackAsync(
      flagSoundRef,
      Haptics.ImpactFeedbackStyle.Light
    );
  }, [lastFlagCaptured, toast, userId, playFeedbackAsync]);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
    }, [])
  );

  const [trackSelf, setTrackSelf] = useState(true);
  const revealCoinsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCoinIdsRef = useRef<Set<string>>(new Set());
  const freeCoinSlotQueueRef = useRef<number[]>(
    Array.from({ length: COIN_SLOT_COUNT }, (_, index) => index)
  );
  const [coinSlots, setCoinSlots] = useState<CoinSlotState[]>(
    () => buildInitialCoinSlots(INITIAL_LAT, INITIAL_LNG)
  );
  const revealCardsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCardIdsRef = useRef<Set<string>>(new Set());
  const freeCardSlotQueueRef = useRef<number[]>(
    Array.from({ length: CARD_SLOT_COUNT }, (_, index) => index)
  );
  const [cardSlots, setCardSlots] = useState<CardSlotState[]>(
    () => buildInitialCardSlots(INITIAL_LAT, INITIAL_LNG)
  );
  const [otherUserSlots, setOtherUserSlots] = useState<OtherUserSlotState[]>(
    () => buildInitialOtherUserSlots(INITIAL_LAT, INITIAL_LNG)
  );
  useEffect(() => {
    setTrackSelf(true);
    const timer = setTimeout(() => setTrackSelf(false), 500);
    return () => clearTimeout(timer);
  }, [userId, avatarId]);
  useEffect(() => {
    // iOS precisa de nova captura quando o estado do radar muda.
    setTrackSelf(true);
    const timer = setTimeout(() => setTrackSelf(false), 220);
    return () => clearTimeout(timer);
  }, [flag?.lat, flag?.lng, flag?.isCaptured]);

  useEffect(() => {
    const collectedCoinId = String(lastRoomCoinGranted?.coinId ?? '');
    if (!collectedCoinId) return;

    // Remove imediatamente do pool visual para não depender apenas da reconciliação do state da sala.
    setCoinSlots((prev) =>
      prev.map((slot) =>
        String(slot.coinId ?? '') === collectedCoinId
          ? { ...slot, coinId: null, visible: false }
          : slot
      )
    );
  }, [lastRoomCoinGranted?.coinId]);

  useEffect(() => {
    if (!explorerGameplayActive) {
      if (revealCoinsTimerRef.current) {
        clearTimeout(revealCoinsTimerRef.current);
        revealCoinsTimerRef.current = null;
      }
      setCoinSlots((prev) => prev.map((slot) => ({ ...slot, coinId: null, visible: false })));
      prevCoinIdsRef.current = new Set();
      freeCoinSlotQueueRef.current = Array.from({ length: COIN_SLOT_COUNT }, (_, index) => index);
      return;
    }

    const orderedCoins = Array.from(coins.values())
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .slice(0, MAX_ACTIVE_COINS);
    const targetCoinsById = new Map(orderedCoins.map((c) => [String(c.id), c]));
    const targetCoinIds = new Set(Array.from(targetCoinsById.keys()));
    const prevCoinIds = prevCoinIdsRef.current;
    const addedCoinIds = Array.from(targetCoinIds).filter((id) => !prevCoinIds.has(id));
    const removedCoinIds = Array.from(prevCoinIds).filter((id) => !targetCoinIds.has(id));
    const isInitialBatch = prevCoinIds.size === 0 && targetCoinIds.size > 0;

    setCoinSlots((prev) => {
      const next = prev.map((slot) => ({ ...slot }));
      const slotByCoinId = new Map<string, number>();
      const freedNowSlots: number[] = [];
      const queue = [...freeCoinSlotQueueRef.current];

      next.forEach((slot, index) => {
        const slotCoinId = slot.coinId ? String(slot.coinId) : null;
        if (slotCoinId && targetCoinIds.has(slotCoinId)) {
          slotByCoinId.set(slotCoinId, index);
        } else if (slotCoinId && removedCoinIds.includes(slotCoinId)) {
          // Remove: só torna transparente e libera o slot; coordenada fica como está.
          slot.coinId = null;
          slot.visible = false;
          freedNowSlots.push(index);
        }
      });

      // Mantém moedas já existentes no mesmo slot, atualizando apenas coordenada.
      for (const [coinId, coin] of targetCoinsById) {
        const existingSlotIndex = slotByCoinId.get(coinId);
        if (existingSlotIndex != null) {
          const slot = next[existingSlotIndex];
          slot.lat = coin.lat;
          slot.lng = coin.lng;
        }
      }

      // Add: pega um slot transparente, move para a coordenada nova e mantém invisível.
      for (const coinId of addedCoinIds) {
        const coin = targetCoinsById.get(coinId);
        if (!coin) continue;
        let freeSlotIndex = -1;
        while (queue.length > 0) {
          const candidate = queue.shift();
          if (candidate == null) break;
          if (next[candidate]?.coinId == null) {
            freeSlotIndex = candidate;
            break;
          }
        }
        if (freeSlotIndex < 0 && freedNowSlots.length > 0) {
          freeSlotIndex = freedNowSlots.shift() ?? -1;
        }
        if (freeSlotIndex < 0) continue;
        const slot = next[freeSlotIndex];
        slot.coinId = coinId;
        slot.lat = coin.lat;
        slot.lng = coin.lng;
        slot.visible = false;
      }

      // Só depois dos adds, devolvemos slots removidos para a fila.
      for (const freed of freedNowSlots) {
        queue.push(freed);
      }
      freeCoinSlotQueueRef.current = queue;

      return next;
    });

    // 1) Entrada na sala: mostra todas as moedas de uma vez, após posicionar slots transparentes.
    // 2) Add: revela somente moedas novas, após reposicionar slot transparente.
    const coinIdsToReveal = new Set(isInitialBatch ? Array.from(targetCoinIds) : addedCoinIds);
    if (revealCoinsTimerRef.current) {
      clearTimeout(revealCoinsTimerRef.current);
      revealCoinsTimerRef.current = null;
    }
    if (coinIdsToReveal.size > 0) {
      revealCoinsTimerRef.current = setTimeout(() => {
        setCoinSlots((prev) =>
          prev.map((slot) =>
            slot.coinId && coinIdsToReveal.has(String(slot.coinId))
              ? { ...slot, visible: true }
              : slot
          )
        );
        revealCoinsTimerRef.current = null;
      }, 140);
    }

    prevCoinIdsRef.current = targetCoinIds;
  }, [coins, explorerGameplayActive]);

  useEffect(() => {
    if (!explorerGameplayActive) {
      if (revealCardsTimerRef.current) {
        clearTimeout(revealCardsTimerRef.current);
        revealCardsTimerRef.current = null;
      }
      setCardSlots((prev) => prev.map((slot) => ({ ...slot, cardId: null, visible: false })));
      prevCardIdsRef.current = new Set();
      freeCardSlotQueueRef.current = Array.from({ length: CARD_SLOT_COUNT }, (_, index) => index);
      return;
    }

    const orderedCards = Array.from(cards.values())
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .slice(0, MAX_ACTIVE_CARDS);
    const targetCardsById = new Map(orderedCards.map((c) => [String(c.id), c]));
    const targetCardIds = new Set(Array.from(targetCardsById.keys()));
    const prevCardIds = prevCardIdsRef.current;
    const addedCardIds = Array.from(targetCardIds).filter((id) => !prevCardIds.has(id));
    const removedCardIds = Array.from(prevCardIds).filter((id) => !targetCardIds.has(id));
    const isInitialBatch = prevCardIds.size === 0 && targetCardIds.size > 0;

    setCardSlots((prev) => {
      const next = prev.map((slot) => ({ ...slot }));
      const slotByCardId = new Map<string, number>();
      const freedNowSlots: number[] = [];
      const queue = [...freeCardSlotQueueRef.current];

      next.forEach((slot, index) => {
        const slotCardId = slot.cardId ? String(slot.cardId) : null;
        if (slotCardId && targetCardIds.has(slotCardId)) {
          slotByCardId.set(slotCardId, index);
        } else if (slotCardId && removedCardIds.includes(slotCardId)) {
          slot.cardId = null;
          slot.visible = false;
          freedNowSlots.push(index);
        }
      });

      for (const [cardId, card] of targetCardsById) {
        const existingSlotIndex = slotByCardId.get(cardId);
        if (existingSlotIndex != null) {
          const slot = next[existingSlotIndex];
          slot.lat = card.lat;
          slot.lng = card.lng;
        }
      }

      for (const cardId of addedCardIds) {
        const card = targetCardsById.get(cardId);
        if (!card) continue;
        let freeSlotIndex = -1;
        while (queue.length > 0) {
          const candidate = queue.shift();
          if (candidate == null) break;
          if (next[candidate]?.cardId == null) {
            freeSlotIndex = candidate;
            break;
          }
        }
        if (freeSlotIndex < 0 && freedNowSlots.length > 0) {
          freeSlotIndex = freedNowSlots.shift() ?? -1;
        }
        if (freeSlotIndex < 0) continue;
        const slot = next[freeSlotIndex];
        slot.cardId = cardId;
        slot.lat = card.lat;
        slot.lng = card.lng;
        slot.visible = false;
      }

      for (const freed of freedNowSlots) {
        queue.push(freed);
      }
      freeCardSlotQueueRef.current = queue;

      return next;
    });

    const cardIdsToReveal = new Set(isInitialBatch ? Array.from(targetCardIds) : addedCardIds);
    if (revealCardsTimerRef.current) {
      clearTimeout(revealCardsTimerRef.current);
      revealCardsTimerRef.current = null;
    }
    if (cardIdsToReveal.size > 0) {
      revealCardsTimerRef.current = setTimeout(() => {
        setCardSlots((prev) =>
          prev.map((slot) =>
            slot.cardId && cardIdsToReveal.has(String(slot.cardId))
              ? { ...slot, visible: true }
              : slot
          )
        );
        revealCardsTimerRef.current = null;
      }, 140);
    }

    prevCardIdsRef.current = targetCardIds;
  }, [cards, explorerGameplayActive]);

  useEffect(() => {
    return () => {
      if (revealCoinsTimerRef.current) {
        clearTimeout(revealCoinsTimerRef.current);
      }
      if (revealCardsTimerRef.current) {
        clearTimeout(revealCardsTimerRef.current);
      }
    };
  }, []);

  // Quando o usuário para de mover o mapa, atualizamos a "localização" = centro do mapa (não do aparelho).
  // Se foi removido por inatividade (desconectado), reconecta ao mover de novo.
  const handleRegionChangeComplete = useCallback(
    (region: MapRegion) => {
      let deltaKm =0
      setPlayerPosition({ lat: region.latitude, lng: region.longitude });
      setMapRegion(region);

      const explorerActiveNow =
        getZoomFromRegion(region.longitudeDelta) >= EXPLORER_ZOOM_THRESHOLD;
      const gameplayActiveNow = explorerActiveNow && effectiveFuel > 0;

      if (!gameplayActiveNow) {
        lastDistanceLatLngRef.current = null;
        return;
      }

      const prev = lastDistanceLatLngRef.current;
      if (prev) {
        deltaKm = haversineDistanceKm(
          prev.lat,
          prev.lng,
          region.latitude,
          region.longitude,
        );
        if (deltaKm > 0.005) {
          setDistanceKm((d) => d + deltaKm);
        }
      }
      lastDistanceLatLngRef.current = { lat: region.latitude, lng: region.longitude };

      if (connected) {
        sendUpdatePosition(region.latitude, region.longitude, effectiveFuel,  deltaKm);
      } else {
        connect(region.latitude, region.longitude);
      }

    },
    [connected, connect, sendUpdatePosition, effectiveFuel]
  );

  const fixedCoinMarkers = useMemo(() => {
    if (!explorerGameplayActive) return [];
    return coinSlots.map((slot, index) => {
      return (
        <Marker
          key={`coin-slot-${index}`}
          coordinate={{ latitude: slot.lat, longitude: slot.lng }}
          tracksViewChanges={true}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.coinSlotFrame} collapsable={false}>
            <Image
              source={coinMarkerSpriteImage}
              style={[
                styles.coinSlotSprite,
                slot.visible ? styles.coinSlotVisible : styles.coinSlotHidden,
              ]}
              contentFit="fill"
            />
          </View>
        </Marker>
      );
    });
  }, [coinSlots, explorerGameplayActive]);

  const fixedCardSlotMarkers = useMemo(() => {
    if (!explorerGameplayActive) return [];
    return cardSlots.map((slot, index) => {
      return (
        <Marker
          key={`card-slot-${index}`}
          zIndex={4}
          coordinate={{ latitude: slot.lat, longitude: slot.lng }}
          tracksViewChanges={true}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.cardSlotFrame} collapsable={false}>
            <Image
              source={cardMarkerSpriteImage}
              style={[
                styles.cardSlotSprite,
                slot.visible ? styles.cardSlotSpriteShow : styles.cardSlotSpriteHide,
              ]}
              contentFit="fill"
            />
          </View>
        </Marker>
      );
    });
  }, [cardSlots, explorerGameplayActive]);

  const otherUsersList = useMemo(
    () => Array.from(otherUsers.values()).filter((u) => String(u.id) !== String(userId)),
    [otherUsers, userId]
  );
  useEffect(() => {
    setNearbyUsers(
      otherUsersList.map((u) => ({
        id: String(u.id),
        username: String(u.username ?? ''),
        avatarId: String(u.avatarId ?? '1'),
        level: Number(u.level ?? 0),
      }))
    );
  }, [otherUsersList, setNearbyUsers]);
  useEffect(() => {
    setOtherUserSlots((prev) =>
      prev.map((slot, index) => {
        const u = otherUsersList[index];
        if (!u) {
          return { ...slot, id: `slot-${index}`, avatarId: '1', visible: false };
        }
        return {
          id: String(u.id),
          avatarId: String(u.avatarId || '1'),
          lat: u.lat,
          lng: u.lng,
          visible: true,
        };
      })
    );
  }, [otherUsersList, roomName]);
  const fixedOtherUserMarkers = useMemo(() => {
    return otherUserSlots.map((slot, index) => (
      <Marker
        key={`other-slot-${index}`}
        zIndex={2}
        coordinate={{ latitude: slot.lat, longitude: slot.lng }}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        {slot.visible ? (
          <OtherUserAvatarMarker avatarId={slot.avatarId} />
        ) : (
          <View style={[styles.otherUserAvatarWrap, styles.otherUserAvatarHidden]} collapsable={false} />
        )}
      </Marker>
    ));
  }, [otherUserSlots]);
  const flagMarker = useMemo(() => {
    if (flag && !flag.isCaptured) {
      return (
        <Marker key="flag" coordinate={{ latitude: flag.lat, longitude: flag.lng }} image={flagMarkerImage}/>
      );
    }
  }, [flag]);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultMapRegion}
        customMapStyle={customMapStyle}
        mapType="standard"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onRegionChange={(region) => {
          regionRef.current = region;
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        <Marker
          key="self"
          zIndex={10}
          tracksViewChanges={trackSelf || keepSelfTrackingForRadar}
          coordinate={{ latitude: playerPosition.lat, longitude: playerPosition.lng }}
          title={username || 'Você'}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <SelfAvatarMarker
            avatarId={avatarId}
            mapCenter={playerPosition}
            roomState={selfRoomState}
            radarEnabled
          />
        </Marker>
        {flagMarker}
        {fixedCoinMarkers}
        {fixedCardSlotMarkers}
        {fixedOtherUserMarkers}
        
      </MapView>
      <MapGradientOverlay />
      <MapGridOverlay />

      {/* Top HUD */}
      <View
        style={[
          styles.topHud,
          {
            paddingTop: insets.top,
            paddingLeft: 16 + insets.left,
            paddingRight: 16 + insets.right,
          },
        ]}
        pointerEvents="box-none">
        <View style={styles.topHudRow}>
          <View style={[styles.hudSideSlot, styles.hudCoinSideSlot]}>
            <View
              style={styles.coinBalancePill}
              accessibilityRole="text"
              accessibilityLabel={`${t('map.coinCollectedTitle')}: ${coinBalance}`}
            >
              <Canvas style={styles.coinPillCanvas}>
                <RoundedRect x={0} y={0} width={110} height={36} r={18}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(110, 36)}
                    colors={[colors.mapHudCoinGradientEdge, colors.mapHudCoinGradientCenter]}
                  />
                </RoundedRect>
              </Canvas>
              <Text style={styles.coinBalanceText}>{coinBalance}</Text>
              <Image source={coinMarkerImage} style={styles.coinBalanceIcon} contentFit="contain" />
            </View>
            {showRewardedAdCta ? (
              <Pressable
                onPress={onPressWatchAd}
                disabled={rewardedAdCtaDisabled}
                style={({ pressed }) => [
                  styles.coinRewardedCta,
                  styles.coinRewardedCtaAbsolute,
                  rewardedAdLoading && styles.coinRewardedCtaMuted,
                  pressed && !rewardedAdCtaDisabled && styles.coinRewardedCtaPressed,
                ]}
                hitSlop={{ top: 6, bottom: 4, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={t('map.rewardedAdCtaAccessibility')}
                accessibilityHint={t('map.rewardedAdCtaHint')}
              >
                <Ionicons name="play-circle" size={15} color={colors.mapHudCoinCtaIcon} />
                <Text style={styles.coinRewardedCtaText}>{t('map.rewardedAdCta')}</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.hudCenterSlot}>
            <FuelIndicatorCircular
              fuel={fuel}
              maxFuel={fuelRuntime.maxFuel}
              fuelRecharge={fuelRuntime}
              focusKey={focusKey}
              onPress={onOpenFuelPurchase}
              accessibilityLabel={t('map.fuelGaugeAccessibility')}
              accessibilityHint={t('map.fuelGaugeHint')}
            />
          </View>
          <View style={styles.hudSideSlot}>
            <XpLevelIndicator xp={xp} focusKey={focusKey} iconPosition="left" />
          </View>
        </View>
      </View>

      {/* Bottom: hint zoom (quando inativo) + dashboard */}
      <View
        style={[
          styles.bottomHud,
          {
            paddingBottom: insets.bottom,
            paddingLeft: 16 + insets.left,
            paddingRight: 16 + insets.right,
          },
        ]}
        pointerEvents="box-none">
        {!explorerModeActive && (
          <View style={styles.explorerHintBar}>
            <Text style={styles.explorerHintBarText} numberOfLines={1}>
              {t('map.explorerModeHint')}
            </Text>
            <Pressable
              onPress={() => setShowExplorerInfoPopup(true)}
              style={styles.explorerHintBarInfoBtn}
              hitSlop={8}
              accessibilityLabel={t('map.explorerModeInfoAccessibility')}
            >
              <Ionicons name="information-circle-outline" size={22} color={colors.primaryLight} />
            </Pressable>
          </View>
        )}
        <MapDashboard
          region={'Belo Horizonte - MG'}
          difficulty="Medium"
          cardsDiscovered={cardsDiscovered}
          totalCards={5}
          fuel={effectiveFuel}
          flagsOwned={flagsOwned}
          ownedAreaKm2={ownedAreaKm2}
          nearmeCount={otherUsers.size}
          coverageCount={coverageCount}
          distanceKm={distanceKm}
          explorerModeActive={explorerModeActive}
          isScanning={isScanning}
          focusKey={focusKey}
        />
      </View>

      {showFuelPurchaseModal ? (
        <FuelPurchaseModal
          visible
          onClose={() => setShowFuelPurchaseModal(false)}
          explorerModeActive={explorerModeActive}
          colyseusConnected={connected}
          coinBalance={coinBalance}
          effectiveFuel={effectiveFuel}
          maxFuel={fuelPurchaseEconomyResolved.maxFuel}
          coinsPerPercent={fuelPurchaseEconomyResolved.fuelPurchaseCoinsPerPercent}
          onPurchase={onPurchaseFuel}
          purchaseSending={fuelPurchaseSending}
          onWatchAd={onPressWatchAd}
          watchAdDisabled={rewardedAdCtaDisabled}
          watchAdLoading={rewardedAdLoading}
        />
      ) : null}

      {cardsPackPending ? (
        <CardsPackModal
          visible
          pack={cardsPackPending}
          onClose={ackCardsPackFeedback}
        />
      ) : null}

      <Modal
        visible={showExplorerInfoPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExplorerInfoPopup(false)}
      >
        <Pressable
          style={styles.explorerPopupBackdrop}
          onPress={() => setShowExplorerInfoPopup(false)}
        >
          <Pressable style={styles.explorerPopupCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.explorerPopupTitle}>{t('map.explorerModeInfoTitle')}</Text>
            <Text style={styles.explorerPopupBody}>{t('map.explorerModeInfoBody')}</Text>
            <Pressable
              style={styles.explorerPopupCloseBtn}
              onPress={() => setShowExplorerInfoPopup(false)}
            >
              <Text style={styles.explorerPopupCloseText}>{t('common.close')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  otherUserAvatarWrap: {
    width: OTHER_PLAYER_AVATAR_OUTER,
    height: OTHER_PLAYER_AVATAR_OUTER,
    borderRadius: OTHER_PLAYER_AVATAR_OUTER / 2,
    borderWidth: OTHER_PLAYER_AVATAR_BORDER,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.cardBorder,
  },
  otherUserAvatarClip: {
    width: OTHER_PLAYER_AVATAR_SIZE,
    height: OTHER_PLAYER_AVATAR_SIZE,
    borderRadius: OTHER_PLAYER_AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  otherUserAvatarImage: {
    width: OTHER_PLAYER_AVATAR_SIZE,
    height: OTHER_PLAYER_AVATAR_SIZE,
    borderRadius: OTHER_PLAYER_AVATAR_SIZE / 2,
  },
  otherUserAvatarHidden: {
    opacity: 0,
  },
  coinMarker: {
    width: COIN_MARKER_SIZE,
    height: COIN_MARKER_SIZE,
    borderRadius: COIN_MARKER_SIZE / 2,
    backgroundColor: COIN_DOT_COLOR,
  },
  flagMarker: {
    width: FLAG_MARKER_SIZE,
    height: FLAG_MARKER_SIZE,
    borderRadius: FLAG_MARKER_SIZE / 2,
    backgroundColor: FLAG_DOT_COLOR,
  },
  coinSlotFrame: {
    width: COIN_SPRITE_FRAME_SIZE,
    height: COIN_SPRITE_FRAME_SIZE,
    overflow: 'hidden',
  },
  coinSlotSprite: {
    width: COIN_SPRITE_FRAME_SIZE,
    height: COIN_SPRITE_FRAME_SIZE,
  },
  cardSlotFrame: {
    width: CARD_SPRITE_FRAME_SIZE*0.75,
    height: CARD_SPRITE_FRAME_SIZE,
    overflow: 'hidden',
  },
  cardSlotSprite: {
    width: CARD_SPRITE_FRAME_SIZE * 2 * 0.75,
    height: CARD_SPRITE_FRAME_SIZE,
  },
  cardSlotSpriteShow: {
    transform: [{ translateX: 0 }],
  },
  cardSlotSpriteHide: {
    transform: [{ translateX: -CARD_SPRITE_FRAME_SIZE }],
  },
  coinSlotVisible: {
    width: 20,
    height: 20,
    opacity: 1,
  },
  coinSlotHidden: {
    width: 20,
    height: 20,
    opacity: 0,
  },
  topHud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'space-between',
  },
  hudSideSlot: {
    width: 110,
    alignItems: 'center',
  },
  /** CTA absoluto: coluna só mede 36px no flex — alinha moedas/XP ao fuel. */
  hudCoinSideSlot: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  },
  hudCenterSlot: {
    flex: 1,
    alignItems: 'center',
  },
  coinBalancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 110,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.mapHudCoinBorder,
    overflow: 'hidden',
  },
  coinPillCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  coinBalanceIcon: {
    width: 22,
    height: 22,
  },
  coinBalanceText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    minWidth: 24,
  },
  coinRewardedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  coinRewardedCtaAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 36 + 7,
  },
  coinRewardedCtaMuted: {
    opacity: 0.58,
  },
  coinRewardedCtaPressed: {
    opacity: 0.92,
  },
  coinRewardedCtaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.mapHudCoinCta,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  explorerHintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.hudCardBackground,
    borderRadius:16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.dashboardBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  explorerHintBarText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  explorerHintBarInfoBtn: {
    padding: 4,
  },
  explorerPopupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  explorerPopupCard: {
    backgroundColor: colors.hudCardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashboardBorder,
    padding: 20,
    maxWidth: 340,
  },
  explorerPopupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  explorerPopupBody: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  explorerPopupCloseBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  explorerPopupCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryLight,
  },
});
