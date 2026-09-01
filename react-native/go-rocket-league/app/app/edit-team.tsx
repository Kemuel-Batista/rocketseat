import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFlagEmojiForCountry } from '@/assets/flags';
import { TeamShieldPicker } from '@/components/TeamShieldPicker';
import { useToast } from '@/components/toast/ToastContainer';
import { resolveCardImageUri } from '@/lib/api/cardImageUri';
import { getBattleTiers, type BattleStakeTier } from '@/lib/api/battlesApi';
import { fetchAllUserInstances } from '@/lib/api/userInstancesApi';
import type { UserInstanceDto } from '@/lib/api/userInstancesApi';
import {
  battlePrefsFromTeamDto,
  buildBattleSettingsBody,
  getUserTeam,
  patchUserTeam,
  patchUserTeamBattleSettings,
  type PatchUserTeamBody,
  type UserTeamDto,
} from '@/lib/api/userTeamApi';
import { getTrades } from '@/lib/api/tradesApi';
import {
  computeTeamOverallFromInstances,
  pickInitialFiveInstanceIds,
} from '@/lib/team/teamScoring';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';
import { useUserStore } from '@/store/userStore';

const SLOT_COUNT = 5;
const DEFAULT_BATTLE_TIERS: { tier: BattleStakeTier; coins: number }[] = [
  { tier: 'COINS_10', coins: 10 },
  { tier: 'COINS_50', coins: 50 },
  { tier: 'COINS_100', coins: 100 },
  { tier: 'COINS_1000', coins: 1000 },
];

function NationBadge({
  nation,
  textStyle,
}: {
  nation?: string | null;
  textStyle?: TextStyle;
}) {
  const raw = nation?.trim();
  if (!raw) return null;
  const emoji = getFlagEmojiForCountry(raw);
  return (
    <Text style={[styles.slotNation, textStyle]} numberOfLines={1}>
      {emoji ? `${emoji} ` : ''}
      {raw}
    </Text>
  );
}

function sortSlots(team: UserTeamDto): string[] {
  const ordered = [...team.slots].sort((a, b) => a.slotIndex - b.slotIndex);
  return ordered.map((s) => s.instance.id);
}

function buildInstanceMap(instances: UserInstanceDto[]): Map<string, UserInstanceDto> {
  const m = new Map<string, UserInstanceDto>();
  for (const i of instances) m.set(i.id, i);
  return m;
}

/** Garante instâncias dos slots do GET /user/team no mapa (URLs e dados completos). */
function mergeTeamSlotsIntoMap(m: Map<string, UserInstanceDto>, team: UserTeamDto | null): void {
  if (!team?.slots?.length) return;
  for (const s of team.slots) {
    if (s.instance?.id) m.set(s.instance.id, s.instance);
  }
}

function instancesValidForSlot(
  slotIndex: number,
  lineup: string[],
  all: UserInstanceDto[],
  byId: Map<string, UserInstanceDto>
): UserInstanceDto[] {
  const otherCardIds = new Set<number>();
  for (let j = 0; j < SLOT_COUNT; j++) {
    if (j === slotIndex) continue;
    const id = lineup[j];
    const inst = byId.get(id);
    if (inst) otherCardIds.add(inst.cardId);
  }
  return all.filter((inst) => {
    if (inst.id === lineup[slotIndex]) return true;
    return !otherCardIds.has(inst.cardId);
  });
}

function buildAutoBestLineup(instances: UserInstanceDto[]): string[] {
  const bestByCard = new Map<number, UserInstanceDto>();
  for (const inst of instances) {
    const prev = bestByCard.get(inst.cardId);
    const currOvr = Number(inst.card?.ovr ?? 0);
    const prevOvr = Number(prev?.card?.ovr ?? 0);
    if (!prev || currOvr > prevOvr) bestByCard.set(inst.cardId, inst);
  }

  const unique = Array.from(bestByCard.values());
  if (unique.length < SLOT_COUNT) return [];

  unique.sort((a, b) => Number(b.card?.ovr ?? 0) - Number(a.card?.ovr ?? 0));
  const pool = unique.slice(0, Math.min(40, unique.length));
  const byId = new Map<string, UserInstanceDto>(pool.map((i) => [i.id, i]));

  let bestIds = pool.slice(0, SLOT_COUNT).map((i) => i.id);
  let bestPreview = computeTeamOverallFromInstances(bestIds, byId);

  const n = pool.length;
  for (let a = 0; a < n - 4; a++) {
    for (let b = a + 1; b < n - 3; b++) {
      for (let c = b + 1; c < n - 2; c++) {
        for (let d = c + 1; d < n - 1; d++) {
          for (let e = d + 1; e < n; e++) {
            const ids = [pool[a].id, pool[b].id, pool[c].id, pool[d].id, pool[e].id];
            const p = computeTeamOverallFromInstances(ids, byId);
            if (
              p.overall > bestPreview.overall ||
              (p.overall === bestPreview.overall &&
                p.nationalityBonusPercent > bestPreview.nationalityBonusPercent)
            ) {
              bestIds = ids;
              bestPreview = p;
            }
          }
        }
      }
    }
  }

  return bestIds;
}

export default function EditTeamScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const battleAvailable = useUserStore((s) => s.battleAvailable);
  const battleStakeTier = useUserStore((s) => s.battleStakeTier);
  const setBattleAvailable = useUserStore((s) => s.setBattleAvailable);
  const setBattleStakeTier = useUserStore((s) => s.setBattleStakeTier);
  const [battleTiers, setBattleTiers] = useState(DEFAULT_BATTLE_TIERS);
  const [battleAvailableDraft, setBattleAvailableDraft] = useState(battleAvailable);
  const [battleStakeTierDraft, setBattleStakeTierDraft] = useState<BattleStakeTier>(battleStakeTier);
  const [battleMinBalanceText, setBattleMinBalanceText] = useState('');
  const [initialBattleAvailable, setInitialBattleAvailable] = useState(battleAvailable);
  const [initialBattleStakeTier, setInitialBattleStakeTier] = useState<BattleStakeTier>(battleStakeTier);
  const [initialBattleMinBalanceText, setInitialBattleMinBalanceText] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [team, setTeam] = useState<UserTeamDto | null>(null);
  const [instances, setInstances] = useState<UserInstanceDto[]>([]);
  const [name, setName] = useState('');
  const [lineup, setLineup] = useState<string[]>(() => Array(SLOT_COUNT).fill(''));

  const [initialName, setInitialName] = useState('');
  const [initialLineup, setInitialLineup] = useState<string[]>(() => Array(SLOT_COUNT).fill(''));

  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [autoBuilding, setAutoBuilding] = useState(false);
  const [tradeLockedIds, setTradeLockedIds] = useState<Set<string>>(new Set());

  const [selectedShieldId, setSelectedShieldId] = useState<number | null>(null);
  const [initialShieldId, setInitialShieldId] = useState<number | null>(null);

  const instanceById = useMemo(() => {
    const m = buildInstanceMap(instances);
    mergeTeamSlotsIntoMap(m, team);
    return m;
  }, [instances, team]);

  const benchInstances = useMemo(() => {
    const inLineup = new Set(lineup.filter(Boolean));
    return instances.filter((i) => !inLineup.has(i.id));
  }, [instances, lineup]);

  const preview = useMemo(() => {
    if (lineup.some((id) => !id)) {
      return null;
    }
    return computeTeamOverallFromInstances(lineup, instanceById);
  }, [lineup, instanceById]);

  const canFieldTeam = instances.length >= 5 && pickInitialFiveInstanceIds(instances).length === SLOT_COUNT;

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const tiersPromise = getBattleTiers().catch(() => null);
      const [teamRes, instList, pendingTrades, tiers] = await Promise.all([
        getUserTeam(),
        fetchAllUserInstances(),
        getTrades({ role: 'initiator', status: 'PENDING', take: 200 }).catch(() => null),
        tiersPromise,
      ]);
      if (tiers && Array.isArray(tiers) && tiers.length > 0) {
        setBattleTiers(tiers);
      } else {
        setBattleTiers(DEFAULT_BATTLE_TIERS);
      }
      setInstances(instList);
      const locked = new Set<string>();
      for (const trade of pendingTrades?.items ?? []) {
        for (const inst of trade.offerFromInitiator ?? []) {
          if (inst?.id) locked.add(inst.id);
        }
      }
      setTradeLockedIds(locked);

      if (teamRes) {
        setTeam(teamRes);
        const lu = sortSlots(teamRes);
        setLineup(lu);
        setInitialLineup([...lu]);
        setName(teamRes.name);
        setInitialName(teamRes.name);
        const sid = teamRes.shieldId ?? null;
        setInitialShieldId(sid);
        setSelectedShieldId(sid);
      } else {
        setTeam(null);
        setInitialShieldId(null);
        setSelectedShieldId(null);
        const initial = pickInitialFiveInstanceIds(instList);
        if (initial.length === SLOT_COUNT) {
          setLineup(initial);
          setInitialLineup([...initial]);
          const def = t('team.defaultName');
          setName(def);
          setInitialName(def);
        } else {
          const empty = Array(SLOT_COUNT).fill('');
          setLineup(empty);
          setInitialLineup(empty);
          setName('');
          setInitialName('');
        }
      }

      const prefs = battlePrefsFromTeamDto(teamRes);
      const minTxt = prefs.openBattleMinBalance != null ? String(prefs.openBattleMinBalance) : '';
      setBattleAvailableDraft(prefs.openForBattle);
      setBattleStakeTierDraft(prefs.openBattleStakeTier);
      setBattleMinBalanceText(minTxt);
      setInitialBattleAvailable(prefs.openForBattle);
      setInitialBattleStakeTier(prefs.openBattleStakeTier);
      setInitialBattleMinBalanceText(minTxt);
      setBattleAvailable(prefs.openForBattle);
      setBattleStakeTier(prefs.openBattleStakeTier);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const nameDirty = name.trim() !== initialName.trim();
  const lineupDirty =
    lineup.length === SLOT_COUNT &&
    initialLineup.length === SLOT_COUNT &&
    lineup.some((id, i) => id !== initialLineup[i]);
  /** Primeiro PATCH com 5 instâncias cria o time no backend (GET /user/team era 404). */
  const needsCreate = !team && lineup.length === SLOT_COUNT && lineup.every(Boolean);
  const shieldDirty = selectedShieldId !== initialShieldId;
  const battleDirty =
    battleAvailableDraft !== initialBattleAvailable ||
    battleStakeTierDraft !== initialBattleStakeTier ||
    battleMinBalanceText.trim() !== initialBattleMinBalanceText.trim();
  const dirty = nameDirty || lineupDirty || needsCreate || shieldDirty || battleDirty;

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!dirty) return;
      e.preventDefault();
      Alert.alert(t('team.unsavedTitle'), t('team.unsavedMessage'), [
        { text: t('team.stayToEdit'), style: 'cancel' },
        {
          text: t('team.leaveWithoutSaving'),
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return unsub;
  }, [navigation, dirty, t]);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.showToast({
        type: 'warning',
        title: t('team.nameRequiredTitle'),
        message: t('team.nameRequiredMessage'),
      });
      return;
    }
    if (lineup.some((id) => !id)) {
      toast.showToast({
        type: 'warning',
        title: t('team.lineupIncompleteTitle'),
        message: t('team.lineupIncompleteMessage'),
      });
      return;
    }

    setSaving(true);
    try {
      const teamBody: PatchUserTeamBody = {};
      if (nameDirty || needsCreate) teamBody.name = trimmed;
      if (lineupDirty || needsCreate) teamBody.instanceIds = [...lineup];
      if (shieldDirty) teamBody.shieldId = selectedShieldId;

      const hasTeamPayload =
        teamBody.name !== undefined ||
        teamBody.instanceIds !== undefined ||
        Object.prototype.hasOwnProperty.call(teamBody, 'shieldId');

      let latestTeam: UserTeamDto | null = team;

      if (hasTeamPayload) {
        latestTeam = await patchUserTeam(teamBody);
        setTeam(latestTeam);
        const lu = sortSlots(latestTeam);
        setLineup(lu);
        setInitialLineup([...lu]);
        setName(latestTeam.name);
        setInitialName(latestTeam.name);
        const sid = latestTeam.shieldId ?? null;
        setInitialShieldId(sid);
        setSelectedShieldId(sid);
      }

      if (battleDirty) {
        if (!latestTeam) {
          toast.showToast({
            type: 'warning',
            title: t('team.saveErrorTitle'),
            message: t('team.battleNeedTeamFirst'),
          });
          return;
        }
        let minBalancePayload: number | null = null;
        if (battleAvailableDraft) {
          const raw = battleMinBalanceText.trim();
          if (raw === '') {
            minBalancePayload = null;
          } else if (!/^\d+$/.test(raw)) {
            toast.showToast({
              type: 'warning',
              title: t('battles.minBalanceInvalidTitle'),
              message: t('battles.minBalanceInvalid'),
            });
            return;
          } else {
            const n = parseInt(raw, 10);
            if (!Number.isFinite(n) || n < 0) {
              toast.showToast({
                type: 'warning',
                title: t('battles.minBalanceInvalidTitle'),
                message: t('battles.minBalanceInvalid'),
              });
              return;
            }
            minBalancePayload = n;
          }
        }
        latestTeam = await patchUserTeamBattleSettings(
          buildBattleSettingsBody(battleAvailableDraft, battleStakeTierDraft, minBalancePayload)
        );
        setTeam(latestTeam);
      }

      if (hasTeamPayload || battleDirty) {
        const prefs = battlePrefsFromTeamDto(latestTeam);
        const minTxt = prefs.openBattleMinBalance != null ? String(prefs.openBattleMinBalance) : '';
        setBattleAvailable(prefs.openForBattle);
        setBattleStakeTier(prefs.openBattleStakeTier);
        setBattleAvailableDraft(prefs.openForBattle);
        setBattleStakeTierDraft(prefs.openBattleStakeTier);
        setBattleMinBalanceText(minTxt);
        setInitialBattleAvailable(prefs.openForBattle);
        setInitialBattleStakeTier(prefs.openBattleStakeTier);
        setInitialBattleMinBalanceText(minTxt);
      }

      toast.showToast({
        type: 'success',
        title: t('team.saveSuccessTitle'),
        message: t('team.saveSuccessMessage'),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.showToast({ type: 'error', title: t('team.saveErrorTitle'), message: msg });
    } finally {
      setSaving(false);
    }
  }, [
    name,
    nameDirty,
    lineup,
    lineupDirty,
    needsCreate,
    initialLineup,
    initialName,
    shieldDirty,
    selectedShieldId,
    battleAvailableDraft,
    battleStakeTierDraft,
    battleMinBalanceText,
    initialBattleAvailable,
    initialBattleStakeTier,
    initialBattleMinBalanceText,
    setBattleAvailable,
    setBattleStakeTier,
    team,
    toast,
  ]);

  const pickerCandidates = useMemo(() => {
    if (pickerSlot === null) return [];
    return instancesValidForSlot(pickerSlot, lineup, instances, instanceById);
  }, [pickerSlot, lineup, instances, instanceById]);

  const openPicker = useCallback((slotIndex: number) => {
    if (!lineup[slotIndex] && !canFieldTeam) return;
    setPickerSlot(slotIndex);
  }, [lineup, canFieldTeam]);

  const selectInstanceForSlot = useCallback(
    (instanceId: string) => {
      if (pickerSlot === null) return;
      setLineup((prev) => {
        const next = [...prev];
        next[pickerSlot] = instanceId;
        return next;
      });
      setPickerSlot(null);
    },
    [pickerSlot]
  );

  const handleAutoBuildLineup = useCallback(async () => {
    if (!canFieldTeam || autoBuilding) return;
    setAutoBuilding(true);
    try {
      // Libera um frame para o loading aparecer antes da busca combinatória.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const best = buildAutoBestLineup(instances);
      if (best.length !== SLOT_COUNT) return;
      setLineup(best);
      const p = computeTeamOverallFromInstances(best, instanceById);
      toast.showToast({
        type: 'success',
        title: t('team.autoBuildSuccessTitle'),
        message: t('team.autoBuildSuccessMessage', {
          overall: p.overall,
          bonus: p.nationalityBonusPercent,
        }),
      });
    } finally {
      setAutoBuilding(false);
    }
  }, [autoBuilding, canFieldTeam, instances, instanceById, toast]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24, backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void reload()}>
          <Text style={styles.retryBtnText}>{t('collection.retry')}</Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!team && !canFieldTeam) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>{t('team.editTitle')}</Text>
          <View style={styles.topBarRight} />
        </View>
        <View style={styles.emptyBlock}>
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('team.cannotCreateTeam')}</Text>
          <Text style={styles.emptySubtitle}>{t('team.needFiveCards')}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>{t('team.editTitle')}</Text>
        <Pressable
          onPress={() => void handleSave()}
          disabled={saving || !dirty}
          style={({ pressed }) => [
            styles.saveBtn,
            (!dirty || saving) && styles.saveBtnDisabled,
            pressed && dirty && !saving && styles.saveBtnPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primaryLight} />
          ) : (
            <Text style={[styles.saveBtnText, !dirty && styles.saveBtnTextDisabled]}>{t('team.save')}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>{t('team.nameLabel')}</Text>
        <TeamShieldPicker
          selectedId={selectedShieldId}
          onSelect={setSelectedShieldId}
          onClear={() => setSelectedShieldId(null)}
          disabled={saving}
        >
          <TextInput
            style={[styles.input, styles.nameInputInRow]}
            value={name}
            onChangeText={setName}
            placeholder={t('team.namePlaceholder')}
            placeholderTextColor={colors.textDisabled}
            maxLength={64}
          />
        </TeamShieldPicker>

        <View style={styles.battleCard}>
          <View style={styles.battleHeaderRow}>
            <Text style={styles.battleTitle}>{t('battles.editTeamTitle')}</Text>
            <Pressable
              onPress={() => setBattleAvailableDraft(!battleAvailableDraft)}
              disabled={saving}
              style={({ pressed }) => [
                styles.battleToggle,
                battleAvailableDraft && styles.battleToggleOn,
                pressed && styles.battleTogglePressed,
              ]}
            >
              <View style={[styles.battleToggleKnob, battleAvailableDraft && styles.battleToggleKnobOn]} />
            </Pressable>
          </View>
          <Text style={styles.battleSubtitle}>
            {t(battleAvailableDraft ? 'battles.editTeamSubtitleOn' : 'battles.editTeamSubtitleOff')}
          </Text>
          {battleAvailableDraft && (
            <>
              <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.battleTiersScroll}>
                <View style={styles.battleTiersRow}>
                  {battleTiers.map((tier) => {
                    const selected = tier.tier === battleStakeTierDraft;
                    return (
                      <Pressable
                        key={tier.tier}
                        onPress={() => setBattleStakeTierDraft(tier.tier)}
                        style={({ pressed }) => [
                          styles.battleTierPill,
                          selected && styles.battleTierPillSelected,
                          pressed && styles.battleTierPillPressed,
                        ]}
                      >
                        <View style={styles.battleTierLine}>
                          <Image source={require('@/assets/coin.png')} style={styles.coinIcon} />
                          <Text style={[styles.battleTierText, selected && styles.battleTierTextSelected]}>
                            {t('battles.coinsAmount', { coins: tier.coins })}
                          </Text>
                        </View>
                        <Text style={[styles.battleTierPot, selected && styles.battleTierTextSelected]}>
                          {t('battles.totalRewardAmount', { coins: tier.coins * 2 })}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </RNScrollView>
              <View style={styles.battleMinBlock}>
                <Text style={styles.battleMinLabel}>{t('battles.minBalanceLabel')}</Text>
                <TextInput
                  style={[styles.input, styles.battleMinInput]}
                  value={battleMinBalanceText}
                  onChangeText={setBattleMinBalanceText}
                  placeholder={t('battles.minBalancePlaceholder')}
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="number-pad"
                  editable={!saving}
                />
                <Text style={styles.battleMinHint}>{t('battles.minBalanceHint')}</Text>
              </View>
            </>
          )}
        </View>

        {preview && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeaderRow}>
              <Text style={styles.previewOverall}>{t('team.previewOverall', { overall: preview.overall })}</Text>
              <Pressable
                onPress={() => setRulesModalVisible(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('team.rulesHintAccessibility')}
              >
                <Ionicons name="help-circle-outline" size={26} color={colors.primaryLight} />
              </Pressable>
            </View>
            <Text style={styles.previewSub}>
              {t('team.previewBase', {
                base: preview.baseOverallSum,
                bonus: preview.nationalityBonusPercent,
              })}
            </Text>
            {preview.nationalitySynergy.length > 0 ? (
              <>
                <Text style={styles.previewSynergyHeader}>{t('team.previewSynergyHeader')}</Text>
                {preview.nationalitySynergy.map((s) => (
                  <Text key={s.nation} style={styles.previewSynergyLine}>
                    {t('team.previewSynergyLine', {
                      nation: s.nation,
                      count: s.count,
                      bonus: s.bonusPercent,
                    })}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.previewHint}>{t('team.previewNoNationBonus')}</Text>
            )}
            <Text style={styles.previewHint}>
              {t('team.previewLargestGroup', { count: preview.maxSameNationCount })}
            </Text>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, styles.sectionTitleNoMargin]}>{t('team.startersTitle')}</Text>
          <Pressable
            onPress={handleAutoBuildLineup}
            disabled={!canFieldTeam || autoBuilding}
            style={({ pressed }) => [
              styles.autoBuildBtn,
              (!canFieldTeam || autoBuilding) && styles.autoBuildBtnDisabled,
              pressed && canFieldTeam && !autoBuilding && styles.autoBuildBtnPressed,
            ]}
          >
            {autoBuilding ? (
              <ActivityIndicator size="small" color={colors.primaryLight} />
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={15} color={colors.primaryLight} />
                <Text style={[styles.autoBuildBtnText, !canFieldTeam && styles.autoBuildBtnTextDisabled]}>
                  {t('team.autoBuildCta')}
                </Text>
              </>
            )}
          </Pressable>
        </View>
        {lineup.map((instanceId, index) => {
          const inst = instanceId ? instanceById.get(instanceId) : undefined;
          const starterThumbUri = resolveCardImageUri(inst?.card?.url);
          return (
            <Pressable
              key={index}
              style={({ pressed }) => [styles.slotRow, pressed && styles.slotRowPressed]}
              onPress={() => openPicker(index)}
            >
              <View style={styles.slotThumb}>
                {starterThumbUri ? (
                  <Image source={{ uri: starterThumbUri }} style={styles.slotImage} contentFit="cover" />
                ) : (
                  <View style={styles.slotPlaceholder}>
                    <Ionicons name="shirt-outline" size={28} color={colors.textDisabled} />
                  </View>
                )}
              </View>
              <View style={styles.slotMeta}>
                <Text style={styles.slotIndex}>{t('team.slotLabel', { index: index + 1 })}</Text>
                <Text style={styles.slotName} numberOfLines={1}>
                  {inst?.card?.name ?? '—'}
                </Text>
                {inst?.card && (
                  <Text style={styles.slotOvr}>OVR {inst.card.ovr}</Text>
                )}
                <NationBadge nation={inst?.card?.nation} />
              </View>
              <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
            </Pressable>
          );
        })}

        <Text style={[styles.sectionTitle, styles.benchSectionTitle]}>{t('team.benchTitle')}</Text>
        {benchInstances.length === 0 ? (
          <Text style={styles.benchEmpty}>{t('team.benchEmpty')}</Text>
        ) : (
          benchInstances.map((inst) => {
            const uri = resolveCardImageUri(inst.card?.url);
            return (
              <View key={inst.id} style={styles.benchRow}>
                <View style={styles.slotThumb}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.slotImage} contentFit="cover" />
                  ) : (
                    <View style={styles.slotPlaceholder}>
                      <Ionicons name="shirt-outline" size={24} color={colors.textDisabled} />
                    </View>
                  )}
                </View>
                <View style={styles.slotMeta}>
                  <Text style={styles.slotName} numberOfLines={1}>
                    {inst.card?.name ?? '—'}
                  </Text>
                  <Text style={styles.slotOvr}>OVR {inst.card?.ovr ?? '—'}</Text>
                  <NationBadge nation={inst.card?.nation} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={pickerSlot !== null} animationType="slide" transparent onRequestClose={() => setPickerSlot(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerSlot(null)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('team.selectPlayerTitle')}</Text>
            <FlatList
              data={pickerCandidates}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const pickUri = resolveCardImageUri(item.card?.url);
                const isTradeLocked = tradeLockedIds.has(item.id);
                return (
                <Pressable
                  style={({ pressed }) => [
                    styles.pickRow,
                    isTradeLocked && styles.pickRowDisabled,
                    pressed && !isTradeLocked && styles.pickRowPressed,
                  ]}
                  onPress={() => {
                    if (isTradeLocked) return;
                    selectInstanceForSlot(item.id);
                  }}
                  disabled={isTradeLocked}
                >
                  {pickUri ? (
                    <Image source={{ uri: pickUri }} style={styles.pickThumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.pickThumb, styles.pickThumbPlaceholder]}>
                      <Ionicons name="shirt-outline" size={22} color={colors.textDisabled} />
                    </View>
                  )}
                  <View style={styles.pickMeta}>
                    <Text style={styles.pickName} numberOfLines={1}>
                      {item.card?.name ?? '—'}
                    </Text>
                    <Text style={styles.pickOvrLine}>OVR {item.card?.ovr ?? '—'}</Text>
                    <NationBadge nation={item.card?.nation} textStyle={styles.pickNationLine} />
                    {isTradeLocked && (
                      <Text style={styles.pickLockText}>{t('team.tradePendingLock')}</Text>
                    )}
                  </View>
                  {!isTradeLocked && item.id === lineup[pickerSlot!] && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  )}
                  {isTradeLocked && (
                    <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                  )}
                </Pressable>
              );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={rulesModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRulesModalVisible(false)}
      >
        <Pressable style={styles.rulesModalOverlay} onPress={() => setRulesModalVisible(false)}>
          <Pressable style={styles.rulesModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.rulesModalHeader}>
              <Text style={styles.rulesModalTitle}>{t('team.rulesModalTitle')}</Text>
              <Pressable
                onPress={() => setRulesModalVisible(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={26} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={styles.rulesModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.rulesBody}>{t('team.rulesIntro')}</Text>
              <Text style={styles.rulesBody}>{t('team.rulesBase')}</Text>
              <Text style={styles.rulesBody}>{t('team.rulesCumulative')}</Text>
              <Text style={styles.rulesBonusTitle}>{t('team.rulesBonusTitle')}</Text>
              <Text style={styles.rulesRow}>{t('team.rulesRow2')}</Text>
              <Text style={styles.rulesRow}>{t('team.rulesRow3')}</Text>
              <Text style={styles.rulesRow}>{t('team.rulesRow4')}</Text>
              <Text style={styles.rulesRow}>{t('team.rulesRow5')}</Text>
              <Text style={styles.rulesExamples}>{t('team.rulesExamples')}</Text>
              <Text style={styles.rulesFormula}>{t('team.rulesFormula')}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarRight: {
    width: 72,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  saveBtn: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: palette.cyan[500] + '33',
    borderWidth: 1,
    borderColor: palette.cyan[500] + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  saveBtnTextDisabled: {
    color: colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  nameInputInRow: {
    marginBottom: 0,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 20,
  },
  battleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  battleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  battleTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  battleSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  battleToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: palette.slate[800],
    justifyContent: 'center',
  },
  battleToggleOn: {
    backgroundColor: palette.cyan[500] + '33',
    borderColor: palette.cyan[500] + '80',
  },
  battleTogglePressed: {
    opacity: 0.9,
  },
  battleToggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textMuted,
    transform: [{ translateX: 0 }],
  },
  battleToggleKnobOn: {
    backgroundColor: colors.primaryLight,
    transform: [{ translateX: 18 }],
  },
  battleTiersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingRight: 12,
  },
  battleTiersScroll: {
    marginTop: 10,
  },
  battleMinBlock: {
    marginTop: 14,
    paddingHorizontal: 2,
  },
  battleMinLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  battleMinInput: {
    marginTop: 8,
  },
  battleMinHint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  battleTierPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: palette.slate[900],
    minWidth: 120,
  },
  battleTierPillSelected: {
    borderColor: palette.yellow[400] + 'CC',
    backgroundColor: palette.yellow[900],
  },
  battleTierPillPressed: {
    opacity: 0.92,
  },
  battleTierText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  battleTierPot: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  battleTierTextSelected: {
    color: palette.yellow[400],
  },
  battleTierLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinIcon: {
    width: 14,
    height: 14,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewOverall: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  previewSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  previewHint: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 8,
  },
  previewSynergyHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 10,
  },
  previewSynergyLine: {
    fontSize: 12,
    color: colors.secondaryLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionTitleNoMargin: {
    marginBottom: 0,
  },
  sectionHeaderRow: {
    marginBottom: 12,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  autoBuildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: palette.cyan[500] + '80',
    backgroundColor: palette.cyan[500] + '26',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  autoBuildBtnPressed: {
    opacity: 0.85,
  },
  autoBuildBtnDisabled: {
    opacity: 0.45,
  },
  autoBuildBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  autoBuildBtnTextDisabled: {
    color: colors.textMuted,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    marginBottom: 8,
  },
  slotRowPressed: {
    opacity: 0.92,
  },
  slotThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: palette.slate[800],
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  slotPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotMeta: {
    flex: 1,
    marginLeft: 12,
  },
  slotIndex: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  slotOvr: {
    fontSize: 13,
    color: colors.primaryLight,
    marginTop: 2,
  },
  slotNation: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryLight,
    marginTop: 4,
  },
  benchSectionTitle: {
    marginTop: 8,
  },
  benchEmpty: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  benchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    marginBottom: 8,
  },
  rulesModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  rulesModalCard: {
    maxHeight: '82%',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  rulesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rulesModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  rulesModalScroll: {
    maxHeight: 420,
  },
  rulesBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 8,
  },
  rulesBonusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  rulesRow: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  rulesExamples: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 10,
  },
  rulesFormula: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textDisabled,
    marginTop: 10,
  },
  errorText: {
    color: colors.destructiveLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.cyan[500] + '33',
    borderWidth: 1,
    borderColor: palette.cyan[500] + '80',
  },
  retryBtnText: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 20,
  },
  backLinkText: {
    color: colors.textMuted,
  },
  emptyBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '72%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalList: {
    flexGrow: 0,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  pickRowPressed: {
    backgroundColor: colors.card,
  },
  pickRowDisabled: {
    opacity: 0.58,
  },
  pickThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: palette.slate[800],
    overflow: 'hidden',
  },
  pickThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickMeta: {
    flex: 1,
    marginLeft: 12,
  },
  pickName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pickOvrLine: {
    fontSize: 13,
    color: colors.primaryLight,
    marginTop: 2,
  },
  pickNationLine: {
    marginTop: 2,
  },
  pickLockText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
