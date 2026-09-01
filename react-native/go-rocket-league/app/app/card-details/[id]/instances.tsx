import {
  Canvas,
  Group,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playerRowToCollectionCard } from '@/demo';
import type { CardInstance, CardStats } from '@/demo';
import {
  getPlayerInstances,
  type PlayerInstanceDto,
} from '@/lib/api/playerInstancesApi';
import { getPlayerById, initPlayersDb } from '@/lib/db/playersDb';
import { useUserStore } from '@/store/userStore';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const DEFAULT_STATS: CardStats = {
  speed: 80,
  shooting: 78,
  passing: 82,
  dribbling: 85,
  defense: 70,
  physical: 75,
};

const STAT_ROW_CONFIG: Array<{
  key: keyof CardStats;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}> = [
  { key: 'speed', icon: 'flash', color: palette.yellow[500] },
  { key: 'shooting', icon: 'target', color: palette.red[500] },
  { key: 'passing', icon: 'share', color: palette.green[500] },
  { key: 'dribbling', icon: 'star', color: palette.purple[500] },
  { key: 'defense', icon: 'shield', color: palette.blue[500] },
  { key: 'physical', icon: 'arm-flex', color: palette.orange[500] },
];

function getStatsWithDefaults(stats?: CardStats | null): CardStats {
  return { ...DEFAULT_STATS, ...stats };
}

const SHIMMER_BAND_WIDTH = 300;
const SHIMMER_DURATION_MS = 5000;

function PlayerHeaderShimmer({ width, height }: { width: number; height: number }) {
  const shimmerX = useSharedValue(-SHIMMER_BAND_WIDTH);

  useEffect(() => {
    if (width <= 0) return;
    shimmerX.value = -SHIMMER_BAND_WIDTH;
    shimmerX.value =
      withTiming(width + SHIMMER_BAND_WIDTH, {
        duration: SHIMMER_DURATION_MS,
        easing: Easing.linear,
      });
  }, [width]);

  const shimmerTransform = useDerivedValue(() => [{ translateX: shimmerX.value }]);

  if (width <= 0 || height <= 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Canvas style={{ width, height }}>
        <Group transform={shimmerTransform}>
          <Rect x={0} y={0} width={SHIMMER_BAND_WIDTH} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SHIMMER_BAND_WIDTH, 0)}
              colors={[
                'transparent',
                palette.cyan[500] + '0a',
                'rgba(255, 255, 255, 0.12)',
                palette.cyan[500] + '0a',
                'transparent',
              ]}
              positions={[0, 0.3, 0.5, 0.7, 1]}
            />
          </Rect>
        </Group>
      </Canvas>
    </View>
  );
}

function formatFoundWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatFoundWhere(w: PlayerInstanceDto['foundWhere']): string {
  if (!w) return '—';
  const parts = [w.city, w.state].filter((x): x is string => !!x && String(x).trim().length > 0);
  if (parts.length > 0) return parts.join(', ');
  if (typeof w.lat === 'number' && typeof w.lng === 'number') {
    return `${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}`;
  }
  return '—';
}

type TradeInstance = CardInstance & {
  ownerId?: string | null;
  ownerUsername?: string | null;
  serialLabel?: string;
  playerName?: string;
  playerImage?: string | null;
  playerOvr?: number | null;
  playerNation?: string | null;
};

function mapPlayerInstance(row: PlayerInstanceDto): TradeInstance {
  return {
    id: row.serialNumber,
    instanceUuid: row.id,
    owner: row.owner?.username ?? '—',
    ownerId: row.owner?.id ?? null,
    ownerUsername: row.owner?.username ?? null,
    serialLabel: row.serialLabel,
    playerName: row.card?.name ?? null,
    playerImage: row.card?.url ?? null,
    playerOvr: row.card?.ovr ?? null,
    playerNation: row.card?.nation ?? null,
    marketValueXp: 0,
    foundWhen: formatFoundWhen(row.foundWhen ?? row.spawnedAt),
    foundWhere: formatFoundWhere(row.foundWhere),
    proposalCount: 0,
  };
}

function isOwnInstance(instance: TradeInstance, currentUsername: string | null): boolean {
  if (!currentUsername || !instance.ownerUsername) return false;
  return instance.ownerUsername.trim().toLowerCase() === currentUsername.trim().toLowerCase();
}

function InstanceRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color={colors.textMuted} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const CARD_ENTRANCE_OFFSET = 80;
const CARD_ENTRANCE_DURATION = 320;
const CARD_ENTRANCE_DELAY_PER_INDEX = 60;

function InstanceCard({
  instance,
  totalCount,
  index = 0,
  canPropose = true,
  onProposePress,
}: {
  instance: TradeInstance;
  totalCount: number;
  index?: number;
  canPropose?: boolean;
  onProposePress?: (instance: TradeInstance) => void;
}) {
  const translateX = useRef(new Animated.Value(-CARD_ENTRANCE_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * CARD_ENTRANCE_DELAY_PER_INDEX;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: CARD_ENTRANCE_DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: CARD_ENTRANCE_DURATION,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateX, opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.instanceId}>
          {instance.id} / {totalCount}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <InstanceRow
          label={t('instances.owner')}
          value={instance.owner ?? '—'}
          icon="person-outline"
        />
        <InstanceRow
          label={t('instances.foundWhen')}
          value={instance.foundWhen}
          icon="calendar-outline"
        />
        <InstanceRow
          label={t('instances.foundWhere')}
          value={instance.foundWhere}
          icon="location-outline"
        />
        <InstanceRow
          label={t('instances.proposals')}
          value={instance.proposalCount}
          icon="chatbubble-ellipses-outline"
        />
        {canPropose ? (
          <Pressable
            style={({ pressed }) => [styles.proposeBtn, pressed && styles.proposeBtnPressed]}
            onPress={() => onProposePress?.(instance)}
            accessibilityLabel={t('instances.makeProposal')}
          >
            <Ionicons name="swap-horizontal" size={18} color={colors.text} />
            <Text style={styles.proposeBtnText}>{t('instances.makeProposal')}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function CardInstancesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cardId = id ? parseInt(id, 10) : NaN;
  const currentUsername = useUserStore((state) => state.username);
  initPlayersDb();
  const player = Number.isNaN(cardId) ? null : getPlayerById(cardId);
  const card = player ? playerRowToCollectionCard(player) : null;

  const [playerHeaderLayout, setPlayerHeaderLayout] = useState({ width: 0, height: 0 });
  const [instances, setInstances] = useState<TradeInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadInstances() {
      if (!card || Number.isNaN(cardId)) {
        if (isActive) {
          setInstances([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await getPlayerInstances(cardId, { limit: 100, offset: 0 });
        if (!isActive) return;
        const mapped = res.instances.map(mapPlayerInstance).sort((a, b) => a.id - b.id);
        setInstances(mapped);
      } catch (e) {
        if (!isActive) return;
        const message = e instanceof Error ? e.message : t('instances.loadError');
        setError(message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadInstances();

    return () => {
      isActive = false;
    };
  }, [cardId]);

  const onPlayerHeaderLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPlayerHeaderLayout((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  if (!card) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{t('instances.cardNotFound')}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const stats = getStatsWithDefaults(card.stats);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle}>{t('instances.navTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.playerHeader} onLayout={onPlayerHeaderLayout}>
        <PlayerHeaderShimmer
          width={playerHeaderLayout.width}
          height={playerHeaderLayout.height}
        />
        <View style={styles.playerNameRow}>
          <Text style={styles.playerName} numberOfLines={1}>
            {card.player}
          </Text>
          <View style={styles.ovrBadge}>
            <Text style={styles.ovrBadgeText}>{card.rating}</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {STAT_ROW_CONFIG.map(({ key, icon, color }) => (
            <View key={key} style={styles.statPill}>
              <MaterialCommunityIcons name={icon} size={18} color={color} />
              <Text style={styles.statPillValue}>{stats[key]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={instances}
        keyExtractor={(item) => item.instanceUuid ?? `${card.id}-${item.id}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.stateText}>{t('instances.loading')}</Text>
          ) : error ? (
            <Text style={styles.stateText}>{error}</Text>
          ) : (
            <Text style={styles.stateText}>{t('instances.empty')}</Text>
          )
        }
        renderItem={({ item, index }) => (
          <InstanceCard
            instance={item}
            totalCount={card.totalCount}
            index={index}
            canPropose={!isOwnInstance(item, currentUsername)}
            onProposePress={(instance) => {
              if (!instance.ownerId || !instance.instanceUuid) return;
              router.push({
                pathname: '/trades/create',
                params: {
                  counterpartyId: instance.ownerId,
                  counterpartyUsername: instance.ownerUsername ?? '',
                  requestInstanceId: instance.instanceUuid,
                  requestSerialLabel: instance.serialLabel ?? `${instance.id}/${card.totalCount}`,
                  requestPlayerName: instance.playerName ?? card.player,
                  requestPlayerImage: instance.playerImage ?? '',
                  requestPlayerOvr: instance.playerOvr != null ? String(instance.playerOvr) : '',
                  requestPlayerNation: instance.playerNation ?? '',
                },
              });
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerBtn: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  playerHeader: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 12,
    overflow: 'hidden',
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  playerName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  ovrBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 12,
  },
  ovrBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statPillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stateText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  instanceId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    width: 90,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 0,
  },
  proposeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary + '80',
  },
  proposeBtnPressed: {
    opacity: 0.9,
  },
  proposeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
