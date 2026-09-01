import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextStyle,
} from 'react-native';
import { Canvas, Group, LinearGradient, Rect, RoundedRect, vec } from '@shopify/react-native-skia';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  type SharedValue,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFlagEmojiForCountry } from '@/assets/flags';
import { MapGridOverlay } from '@/components/MapGridOverlay';
import { buildTeamShieldUri, resolveCardImageUri } from '@/lib/api/cardImageUri';
import type { WinnerRevealContent, WinnerRevealSlot, WinnerRevealTeamPayload } from '@/lib/battle/battleRevealTypes';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const INTRO_MS = 3000;
/** Cada carta: revelação + contador no mesmo “beat” (lados alternados, nunca os dois placares ao mesmo tempo). */
const REVEAL_STEP_MS = 900;
const REVEAL_SCORE_MS = 900;
const TO_BONUS_MS = 400;
const BONUS_SCORE_MS = 900;
/** Primeira linha de sinergia após entrar na fase bônus. */
const BONUS_FIRST_ROW_DELAY_MS = 800;
/** Cada linha de bônus (mesmo “beat” das cartas). */
const BONUS_ROW_MS = 300;
/** Após revelar todas as linhas: pausa antes de animar placar final. */
const BONUS_POST_ROWS_PAUSE_MS = 400;
/** Após animar os dois placares: margem antes de surpresa/resultado. */
const BONUS_TAIL_MS = 700;
/** Altura máxima do bottom sheet de sinergia (fração da tela + teto). */
const BONUS_SHEET_HEIGHT_FRAC = 0.42;
const BONUS_SHEET_HEIGHT_CAP = 380;
const BONUS_SHEET_HANDLE_BLOCK_H = 26;

type SynergyEntry = { nation: string; count: number; bonusPercent: number };

type BonusRevealStep = { side: 'challenger' | 'challenged'; entry: SynergyEntry | null };

/** Alterna lados como as cartas: por índice i, revela linha i do desafiante e depois do adversário (ou placeholder vazio). */
function buildBonusRevealSteps(chAll: SynergyEntry[], cdAll: SynergyEntry[]): BonusRevealStep[] {
  const ch = chAll.filter((e) => e.bonusPercent > 0);
  const cd = cdAll.filter((e) => e.bonusPercent > 0);
  const maxLen = Math.max(ch.length, cd.length, 1);
  const steps: BonusRevealStep[] = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < ch.length) steps.push({ side: 'challenger', entry: ch[i] });
    else if (ch.length === 0 && i === 0) steps.push({ side: 'challenger', entry: null });
    if (i < cd.length) steps.push({ side: 'challenged', entry: cd[i] });
    else if (cd.length === 0 && i === 0) steps.push({ side: 'challenged', entry: null });
  }
  return steps;
}

type Phase = 'intro' | 'revealing' | 'bonus' | 'surprise' | 'result';

function sortSlots(slots: WinnerRevealSlot[]): WinnerRevealSlot[] {
  return [...slots].sort((a, b) => a.slotIndex - b.slotIndex);
}

function shieldUri(team: WinnerRevealTeamPayload): string | undefined {
  if (team.shieldId != null && team.shieldId > 0) return buildTeamShieldUri(team.shieldId);
  return resolveCardImageUri(team.shieldUrl);
}

/** Prefetch durante intro/reveal: mesmas URLs que `Image` usa (`memory-disk`). */
function collectRevealImagePrefetchUris(content: WinnerRevealContent): string[] {
  const seen = new Set<string>();
  const add = (raw: string | null | undefined) => {
    const uri = resolveCardImageUri(raw);
    if (uri) seen.add(uri);
  };
  const addDirect = (u: string | undefined) => {
    if (u) seen.add(u);
  };
  for (const s of content.challenger.slots) add(s.imageUrl);
  for (const s of content.challenged.slots) add(s.imageUrl);
  if (content.surpriseRewardCard) add(content.surpriseRewardCard.imageUrl);
  addDirect(shieldUri(content.challenger));
  addDirect(shieldUri(content.challenged));
  return [...seen];
}

function isSlotRevealed(revealStep: number, side: 'challenger' | 'challenged', index: number): boolean {
  if (side === 'challenger') return revealStep > index * 2;
  return revealStep > index * 2 + 1;
}

const INTRO_LOGO_SRC = require('@/assets/images/logo.png');

const INTRO_SHIELD_SIZE = 76;

function IntroShield({
  uri,
  accentColor,
}: {
  uri?: string;
  accentColor: string;
}) {
  const size = INTRO_SHIELD_SIZE;
  const inner = (
    <>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden' }} contentFit="contain" />
      ) : (
        <Ionicons name="shield-outline" size={Math.round(size * 0.45)} color={accentColor} />
      )}
    </>
  );

  return (
    <View
      style={[
        styles.introShieldFrame,
        {
          width: size,
          height: size,
          shadowColor: accentColor,
        },
      ]}
    >
      {inner}
    </View>
  );
}

function IntroClubName({
  children,
  variantStyle,
  glowColor,
}: {
  children: string;
  variantStyle: TextStyle;
  glowColor: string;
}) {
  const textProps = {
    numberOfLines: 1 as const,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.35,
  };

  return (
    <View style={styles.introNameStack}>
      <Text
        style={[
          variantStyle,
          styles.introNameGlowBackdrop,
          { color: glowColor, textShadowColor: glowColor },
        ]}
        {...textProps}
      >
        {children}
      </Text>
      <Text style={[variantStyle, styles.introNameGlowFace, { textShadowColor: glowColor }]} {...textProps}>
        {children}
      </Text>
    </View>
  );
}

const BATTLE_RED = palette.red[400];
const BATTLE_RED_BORDER = palette.red[500];
const BATTLE_BLUE = palette.cyan[400];
const BATTLE_BLUE_BORDER = palette.cyan[600];
const BATTLE_BAR_H = 16;
const BATTLE_BAR_R = 8;
/** Largura da faixa de fusão (gradiente vermelho ↔ ciano + shimmer). */
const BATTLE_BAR_FUSION_W = 32;
/** Faixa horizontal do brilho sobre a fusão (centrada no split, sem animação lateral própria). */
const BATTLE_BAR_SHIMMER_W = 104;
/** Gradiente horizontal longo fixo (evita `end` animado com `vec()` — crash nativo no Skia). */
const BATTLE_BAR_GRADIENT_END = vec(2000, BATTLE_BAR_H / 2);

/** Android não aplica `shadowColor` — halo colorido via camada semitransparente. */
const ANDROID_TEAM_CARD_GLOW = {
  red: 'rgba(239, 68, 68, 0.44)',
  blue: 'rgba(34, 211, 238, 0.34)',
} as const;
const ANDROID_SHIELD_GLOW = {
  red: 'rgba(248, 113, 113, 0.42)',
  blue: 'rgba(34, 211, 238, 0.36)',
} as const;

function BattleTeamCardWrap({
  androidGlow,
  children,
}: {
  androidGlow: keyof typeof ANDROID_TEAM_CARD_GLOW;
  children: React.ReactNode;
}) {
  if (Platform.OS !== 'android') {
    return <>{children}</>;
  }
  return (
    <View
      style={[
        styles.battleCardGlowOuter,
        androidGlow === 'red' ? styles.battleCardGlowOuterRed : styles.battleCardGlowOuterBlue,
      ]}>
      {children}
    </View>
  );
}

function BattleShieldIcon({
  uri,
  accentColor,
  size = 52,
  glowTint,
}: {
  uri?: string;
  accentColor: string;
  size?: number;
  /** Halo colorido no Android (iOS usa `shadowColor` no frame). */
  glowTint?: keyof typeof ANDROID_SHIELD_GLOW;
}) {
  const frame = (
    <View
      style={[
        styles.battleShieldFrame,
        { width: size, height: size },
        Platform.OS === 'ios' ? { shadowColor: accentColor } : null,
      ]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden' }} contentFit="contain" />
      ) : (
        <Ionicons name="shield-outline" size={Math.round(size * 0.44)} color={accentColor} />
      )}
    </View>
  );

  if (Platform.OS === 'android' && glowTint) {
    const pad = 3;
    const outerR = Math.min(20, 12 + pad + 2);
    return (
      <View
        style={[
          styles.battleShieldAndroidGlow,
          {
            padding: pad,
            borderRadius: outerR,
            backgroundColor: ANDROID_SHIELD_GLOW[glowTint],
          },
        ]}>
        {frame}
      </View>
    );
  }

  return frame;
}

function BattleProgressBar({
  challengerScore,
  challengedScore,
}: {
  challengerScore: number;
  challengedScore: number;
}) {
  const layoutW = useSharedValue(0);
  const [canvasW, setCanvasW] = useState(0);
  const splitProgress = useSharedValue(0.5);

  const safeLayout = useDerivedValue(() => Math.max(1, layoutW.value));

  const leftFill = useDerivedValue(() => safeLayout.value * splitProgress.value);
  const rightWidth = useDerivedValue(() => Math.max(0, layoutW.value - leftFill.value));

  const fusionMargin = BATTLE_BAR_FUSION_W + 8;
  const fusionOpacity = useDerivedValue(() => {
    const w = layoutW.value;
    if (w <= fusionMargin * 2) return 0;
    const lf = leftFill.value;
    if (lf <= fusionMargin || lf >= w - fusionMargin) return 0;
    return 1;
  });

  const fusionCoreX = useDerivedValue(() => leftFill.value - BATTLE_BAR_FUSION_W / 2);

  /** Centro da fusão = `leftFill` (mesmo eixo que `fusionCoreX + BATTLE_BAR_FUSION_W/2`). Brilho só acompanha o split. */
  const shimmerCenteredTransform = useDerivedValue(() => [
    { translateX: leftFill.value - BATTLE_BAR_SHIMMER_W / 2 },
  ]);

  useEffect(() => {
    const sum = challengerScore + challengedScore;
    const p = sum === 0 ? 0.5 : challengerScore / sum;
    splitProgress.value = withTiming( Math.min(1, Math.max(0, p)), { duration: 520, easing: Easing.out(Easing.cubic) });
  }, [challengerScore, challengedScore, splitProgress]);

  const yOff = 4;

  return (
    <View
      style={styles.battleBarGlowWrap}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        layoutW.value = w;
        setCanvasW(w);
      }}>
      {canvasW > 10 ? (
        <Canvas style={{ width: canvasW, height: BATTLE_BAR_H + yOff * 2 }} pointerEvents="none">
          <RoundedRect
            x={0}
            y={yOff}
            width={canvasW}
            height={BATTLE_BAR_H}
            r={BATTLE_BAR_R}
            color="rgba(15, 23, 42, 0.96)"
          />
          <RoundedRect
            x={0}
            y={yOff}
            width={leftFill}
            height={BATTLE_BAR_H}
            r={BATTLE_BAR_R}>
            <LinearGradient
              start={vec(0, BATTLE_BAR_H / 2)}
              end={BATTLE_BAR_GRADIENT_END}
              colors={[BATTLE_RED_BORDER, palette.orange[500]]}
            />
          </RoundedRect>
          <RoundedRect
            x={leftFill}
            y={yOff}
            width={rightWidth}
            height={BATTLE_BAR_H}
            r={BATTLE_BAR_R}>
            <LinearGradient
              start={vec(0, BATTLE_BAR_H / 2)}
              end={BATTLE_BAR_GRADIENT_END}
              colors={[palette.cyan[800], BATTLE_BLUE]}
            />
          </RoundedRect>
          <Group opacity={fusionOpacity}>
            <RoundedRect
              x={fusionCoreX}
              y={yOff}
              width={BATTLE_BAR_FUSION_W}
              height={BATTLE_BAR_H}
              r={BATTLE_BAR_H / 2}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(BATTLE_BAR_FUSION_W, 0)}
                colors={[
                  BATTLE_RED_BORDER,
                  palette.orange[500],
                  palette.amber[400],
                  palette.yellow[400],
                  '#ffffff',
                  '#ffffff',
                  palette.cyan[500],
                  BATTLE_BLUE,
                  palette.cyan[400],
                ]}
                positions={[0, 0.1, 0.22, 0.34, 0.44, 0.56, 0.66, 0.82, 1]}
              />
            </RoundedRect>
            <Group transform={shimmerCenteredTransform}>
              <Rect x={0} y={yOff} width={BATTLE_BAR_SHIMMER_W} height={BATTLE_BAR_H}>
                <LinearGradient
                  start={vec(0, BATTLE_BAR_H / 2)}
                  end={vec(BATTLE_BAR_SHIMMER_W, BATTLE_BAR_H / 2)}
                  colors={[
                    'rgba(255,255,255,0)',
                    'rgba(255,255,255,0.08)',
                    'rgba(255,255,255,0.55)',
                    'rgba(255,255,255,0.98)',
                    'rgba(255,255,255,1)',
                    'rgba(255,255,255,0.98)',
                    'rgba(255,255,255,0.55)',
                    'rgba(255,255,255,0.08)',
                    'rgba(255,255,255,0)',
                  ]}
                  positions={[0, 0.12, 0.28, 0.42, 0.5, 0.58, 0.72, 0.88, 1]}
                />
              </Rect>
            </Group>
          </Group>
        </Canvas>
      ) : null}
    </View>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/** Contador no UI thread (sem `useState` por frame). Duração da fase reveal: `REVEAL_SCORE_MS` (lados alternados). */
function BattleScoreAnimated({ valueSv }: { valueSv: SharedValue<number> }) {
  // `text` é prop de animação do Reanimated (não existe em TextInputProps); cast evita erro de tipos.
  const animatedProps = useAnimatedProps(() => {
    const s = String(Math.round(valueSv.value));
    return { text: s, defaultValue: s };
  }) as React.ComponentProps<typeof AnimatedTextInput>['animatedProps'];
  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      caretHidden
      showSoftInputOnFocus={false}
      underlineColorAndroid="transparent"
      defaultValue="0"
      allowFontScaling={false}
      multiline={false}
      style={[styles.battleScoreBig, styles.battleScoreBigInput]}
    />
  );
}

function BattleIntroLayer({
  myTeam,
  opponentTeam,
}: {
  myTeam: WinnerRevealTeamPayload;
  opponentTeam: WinnerRevealTeamPayload;
}) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.065, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(pulse);
      pulse.value = 1;
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.065], [0.88, 1]),
  }));

  const pulseStyleText = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 0.8 }],
    opacity: interpolate(pulse.value, [1, 1.065], [0.3, 1]),
  }));

  const myShieldUri = useMemo(() => shieldUri(myTeam), [myTeam]);
  const oppShieldUri = useMemo(() => shieldUri(opponentTeam), [opponentTeam]);

  return (
    <View style={styles.introStage}>
      <View style={styles.introForeground} pointerEvents="none">
        <View style={[styles.introCenterBlock, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.introNameColumn}>
            <Animated.View style={[pulseStyle, styles.introTeamBlockEdge]}>
              <IntroShield uri={myShieldUri} accentColor={palette.red[400]} />
              <View style={styles.introNameTextWrap}>
                <IntroClubName variantStyle={styles.introNameMy} glowColor={palette.red[400]}>
                  {myTeam.teamName}
                </IntroClubName>
              </View>
            </Animated.View>

            <Animated.View style={[pulseStyle, styles.introLogoWrap]}>
              <Image
                source={INTRO_LOGO_SRC}
                style={styles.introLeagueLogo}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </Animated.View>

            <Animated.View style={[pulseStyle, styles.introTeamBlockEdge]}>
              <View style={styles.introNameTextWrap}>
                <IntroClubName variantStyle={styles.introNameOpp} glowColor={palette.cyan[400]}>
                  {opponentTeam.teamName}
                </IntroClubName>
              </View>
              <IntroShield uri={oppShieldUri} accentColor={palette.cyan[400]} />
            </Animated.View>
          </View>
        </View>
        <Animated.View
          style={[
            pulseStyleText,
            {
              position: 'absolute',
              left: 20,
              right: 20,
              bottom: Math.max(20, insets.bottom + 8),
            },
          ]}
        >
          <Text style={styles.introBattleStarting}>{t('battles.battleStarting')}...</Text>
        </Animated.View>
      </View>
    </View>
  );
}

export type WinnerRevealProps = {
  visible: boolean;
  onClose: () => void;
  content: WinnerRevealContent;
};

const CardsColumn = React.memo(function CardsColumn({
  slots,
  rowCount,
  side,
  revealStep,
  heroReveal,
  accent,
  imageRefs,
  imageTowardCenter,
}: {
  slots: WinnerRevealSlot[];
  rowCount: number;
  side: 'challenger' | 'challenged';
  revealStep: number;
  heroReveal: {
    side: 'challenger' | 'challenged';
    index: number;
    slot: WinnerRevealSlot;
  } | null;
  accent: string;
  imageRefs: React.MutableRefObject<(View | null)[]>;
  imageTowardCenter: 'leading' | 'trailing';
}) {
  return (
    <View style={styles.cardCol}>
      {Array.from({ length: rowCount }, (_, index) => {
        const slot = slots[index];
        const isHero = heroReveal?.side === side && heroReveal.index === index;

        if (!slot) {
          return <View key={`empty-${side}-${index}`} style={styles.cardSlotPlaceholder} />;
        }

        return (
          <RevealCard
            key={slot.slotIndex}
            imageRef={(el) => {
              imageRefs.current[index] = el;
            }}
            slot={slot}
            revealed={isSlotRevealed(revealStep, side, index) || isHero}
            hideImage={isHero}
            accent={accent}
            imageTowardCenter={imageTowardCenter}
            metaAlign={side === 'challenger' ? 'end' : 'start'}
          />
        );
      })}
    </View>
  );
});

const BattleSlotVsColumn = React.memo(function BattleSlotVsColumn({ rowCount }: { rowCount: number }) {
  return (
    <View style={styles.cardsVsColumn} pointerEvents="none">
      {Array.from({ length: rowCount }, (_, index) => (
        <View key={`vs-${index}`} style={styles.cardsVsSlot}>
          <Text style={styles.cardsVsX} allowFontScaling={false}>
            ×
          </Text>
        </View>
      ))}
    </View>
  );
});

export function WinnerReveal({ visible, onClose, content }: WinnerRevealProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { challenger, challenged, winnerSide, viewerRole, surpriseRewardCard } = content;
  const surpriseSlot = surpriseRewardCard ?? null;
  const viewerIsWinner = viewerRole != null && viewerRole === winnerSide;

  const chSlots = useMemo(() => sortSlots(challenger.slots), [challenger.slots]);
  const cdSlots = useMemo(() => sortSlots(challenged.slots), [challenged.slots]);
  const slotRowCount = useMemo(() => Math.max(chSlots.length, cdSlots.length), [chSlots.length, cdSlots.length]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [revealStep, setRevealStep] = useState(0);
  const [challengerBase, setChallengerBase] = useState(0);
  const [challengedBase, setChallengedBase] = useState(0);
  const [showBonusDetail, setShowBonusDetail] = useState(false);
  const [bonusRevealCount, setBonusRevealCount] = useState(0);
  const [bonusSheetContentH, setBonusSheetContentH] = useState(0);
  const bonusScoreAnimStartedRef = useRef(false);
  const [heroReveal, setHeroReveal] = useState<null | {
    side: 'challenger' | 'challenged';
    index: number;
    slot: WinnerRevealSlot;
  }>(null);
  const challengerImageRefs = useRef<(View | null)[]>([]);
  const challengedImageRefs = useRef<(View | null)[]>([]);
  const heroRevealRef = useRef(heroReveal);
  heroRevealRef.current = heroReveal;

  const challengerScoreSv = useSharedValue(0);
  const challengedScoreSv = useSharedValue(0);
  const prevChallengerBaseRef = useRef(0);
  const prevChallengedBaseRef = useRef(0);

  const bonusSteps = useMemo(
    () => buildBonusRevealSteps(challenger.nationalitySynergy, challenged.nationalitySynergy),
    [challenger.nationalitySynergy, challenged.nationalitySynergy],
  );

  const bonusRevealState = useMemo(() => {
    const slice = bonusSteps.slice(0, bonusRevealCount);
    const chFull = challenger.nationalitySynergy.filter((e) => e.bonusPercent > 0);
    const cdFull = challenged.nationalitySynergy.filter((e) => e.bonusPercent > 0);
    const chVisible = slice
      .filter((s) => s.side === 'challenger' && s.entry !== null)
      .map((s) => s.entry!);
    const cdVisible = slice
      .filter((s) => s.side === 'challenged' && s.entry !== null)
      .map((s) => s.entry!);
    const chShowEmpty = slice.some((s) => s.side === 'challenger' && s.entry === null);
    const cdShowEmpty = slice.some((s) => s.side === 'challenged' && s.entry === null);
    return { chFull, cdFull, chVisible, cdVisible, chShowEmpty, cdShowEmpty };
  }, [bonusSteps, bonusRevealCount, challenger.nationalitySynergy, challenged.nationalitySynergy]);

  const reset = useCallback(() => {
    setPhase('intro');
    setRevealStep(0);
    setChallengerBase(0);
    setChallengedBase(0);
    setShowBonusDetail(false);
    setBonusRevealCount(0);
    setBonusSheetContentH(0);
    bonusScoreAnimStartedRef.current = false;
    setHeroReveal(null);
    challengerImageRefs.current = [];
    challengedImageRefs.current = [];
    prevChallengerBaseRef.current = 0;
    prevChallengedBaseRef.current = 0;
  }, []);

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [visible, reset, content]);

  useEffect(() => {
    if (!visible) return;
    const urls = collectRevealImagePrefetchUris(content);
    if (urls.length === 0) return;
    void Image.prefetch(urls, 'memory-disk');
  }, [visible, content]);

  useEffect(() => {
    if (!visible) return;
    cancelAnimation(challengerScoreSv);
    cancelAnimation(challengedScoreSv);
    challengerScoreSv.value = 0;
    challengedScoreSv.value = 0;
  }, [visible, content]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setPhase('revealing'), INTRO_MS);
    return () => clearTimeout(timer);
  }, [visible, content]);

  useEffect(() => {
    if (phase !== 'revealing') return;
    if (challengerBase === prevChallengerBaseRef.current) return;
    prevChallengerBaseRef.current = challengerBase;
    challengerScoreSv.value = withTiming(challengerBase, {
      duration: REVEAL_SCORE_MS,
      easing: Easing.linear,
    });
  }, [challengerBase, phase]);

  useEffect(() => {
    if (phase !== 'revealing') return;
    if (challengedBase === prevChallengedBaseRef.current) return;
    prevChallengedBaseRef.current = challengedBase;
    challengedScoreSv.value = withTiming(challengedBase, {
      duration: REVEAL_SCORE_MS,
      easing: Easing.linear,
    });
  }, [challengedBase, phase]);

  useEffect(() => {
    if (phase !== 'bonus') {
      bonusScoreAnimStartedRef.current = false;
      return;
    }
    if (bonusRevealCount < bonusSteps.length) return;
    if (bonusScoreAnimStartedRef.current) return;
    bonusScoreAnimStartedRef.current = true;
    setShowBonusDetail(true);
    cancelAnimation(challengerScoreSv);
    cancelAnimation(challengedScoreSv);
    const chTo = challenger.overall;
    const cdTo = challenged.overall;
    const chDelta = Math.abs(chTo - challengerScoreSv.value);
    const cdDelta = Math.abs(cdTo - challengedScoreSv.value);

    let t1: ReturnType<typeof setTimeout> | undefined;
    const t0 = setTimeout(() => {
      challengerScoreSv.value =
        chDelta < 0.5 ? chTo : withTiming(chTo, { duration: BONUS_SCORE_MS, easing: Easing.out(Easing.cubic) });

      const delay = chDelta < 0.5 ? 0 : BONUS_SCORE_MS;
      t1 = setTimeout(() => {
        challengedScoreSv.value =
          cdDelta < 0.5 ? cdTo : withTiming(cdTo, { duration: BONUS_SCORE_MS, easing: Easing.out(Easing.cubic) });
      }, delay);
    }, BONUS_POST_ROWS_PAUSE_MS);
    return () => {
      clearTimeout(t0);
      if (t1) clearTimeout(t1);
    };
  }, [phase, bonusRevealCount, bonusSteps.length, challenger.overall, challenged.overall]);

  useEffect(() => {
    if (!visible || phase !== 'revealing') return;
    if (heroReveal) return;
    if (revealStep >= 10) {
      const t = setTimeout(() => setPhase('bonus'), TO_BONUS_MS);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(() => {
      const isChallenger = revealStep % 2 === 0;
      const idx = Math.floor(revealStep / 2);
      const slot = isChallenger ? chSlots[idx] : cdSlots[idx];
      if (!slot) {
        setRevealStep(10);
        return;
      }
      setHeroReveal({
        side: isChallenger ? 'challenger' : 'challenged',
        index: idx,
        slot,
      });
    }, REVEAL_STEP_MS);
    return () => clearTimeout(timer);
  }, [visible, phase, revealStep, heroReveal, chSlots, cdSlots]);

  useEffect(() => {
    if (!visible || phase !== 'bonus') return;
    if (bonusRevealCount >= bonusSteps.length) return;
    const delay = bonusRevealCount === 0 ? BONUS_FIRST_ROW_DELAY_MS : BONUS_ROW_MS;
    const t = setTimeout(() => setBonusRevealCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [visible, phase, bonusRevealCount, bonusSteps.length]);

  useEffect(() => {
    if (!visible || phase !== 'bonus') return;
    if (bonusRevealCount < bonusSteps.length) return;
    const delay = BONUS_POST_ROWS_PAUSE_MS + BONUS_SCORE_MS * 2 + BONUS_TAIL_MS;
    const t = setTimeout(() => {
      if (surpriseSlot && viewerIsWinner) setPhase('surprise');
      else setPhase('result');
    }, delay);
    return () => clearTimeout(t);
  }, [visible, phase, bonusRevealCount, bonusSteps.length, surpriseSlot, viewerIsWinner]);

  const winnerTeam = winnerSide === 'challenger' ? challenger : challenged;
  const loserTeam = winnerSide === 'challenger' ? challenged : challenger;
  const viewerWon =
    viewerRole != null && viewerRole === winnerSide ? true : viewerRole != null ? false : null;

  const myTeam = viewerRole === 'challenged' ? challenged : challenger;
  const opponentTeam = viewerRole === 'challenged' ? challenger : challenged;

  const handleRequestClose = useCallback(() => {
    if (phase === 'surprise') setPhase('result');
    else if (phase === 'result') onClose();
  }, [phase, onClose]);

  const handleSurpriseContinue = useCallback(() => setPhase('result'), []);

  const handleHeroDone = useCallback(() => {
    const h = heroRevealRef.current;
    if (!h) return;
    const { side, slot } = h;
    if (side === 'challenger') setChallengerBase((x) => x + slot.ovr);
    else setChallengedBase((x) => x + slot.ovr);
    setRevealStep((s) => s + 1);
    setHeroReveal(null);
  }, []);

  const chShieldUri = useMemo(() => shieldUri(challenger), [challenger]);
  const cdShieldUri = useMemo(() => shieldUri(challenged), [challenged]);
  const challengerDisplayScore = phase === 'revealing' ? challengerBase : challenger.overall;
  const challengedDisplayScore = phase === 'revealing' ? challengedBase : challenged.overall;

  const bonusSheetMaxHeight = useMemo(
    () => Math.min(Math.round(windowHeight * BONUS_SHEET_HEIGHT_FRAC), BONUS_SHEET_HEIGHT_CAP),
    [windowHeight],
  );
  /** Altura do painel: cresce com o conteúdo até `bonusSheetMaxHeight` (evita cortar texto). */
  const bonusSheetShellH = useMemo(() => {
    if (phase !== 'bonus') return 0;
    const measured = bonusSheetContentH > 0 ? bonusSheetContentH : 120;
    return Math.min(
      bonusSheetMaxHeight,
      Math.max(BONUS_SHEET_HANDLE_BLOCK_H + 56, BONUS_SHEET_HANDLE_BLOCK_H + measured),
    );
  }, [phase, bonusSheetMaxHeight, bonusSheetContentH]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleRequestClose}>
      <View
        style={[
          styles.backdrop,
          phase === 'intro' ? styles.backdropIntro : { paddingTop: insets.top },
        ]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <MapGridOverlay />
        </View>
        {heroReveal && phase === 'revealing' ? (
          <BattleRevealHeroFly
            key="hero"
            slot={heroReveal.slot}
            accent={heroReveal.side === 'challenger' ? BATTLE_RED_BORDER : BATTLE_BLUE_BORDER}
            getImageTarget={() =>
              heroReveal.side === 'challenger'
                ? challengerImageRefs.current[heroReveal.index]
                : challengedImageRefs.current[heroReveal.index]
            }
            onDone={handleHeroDone}
          />
        ) : null}
        <View style={[styles.sheet, phase === 'intro' && styles.sheetIntroFull]}>
          {phase === 'intro' && (
            <BattleIntroLayer myTeam={myTeam} opponentTeam={opponentTeam} />
          )}

          {(phase === 'revealing' || phase === 'bonus' || phase === 'surprise' || phase === 'result') && (
            <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{
                paddingBottom:
                  insets.bottom + 24 + (phase === 'bonus' ? bonusSheetShellH : 0),
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.battleHeaderBlock}>
                <View style={styles.battleCardsRow}>
                  <BattleTeamCardWrap androidGlow="red">
                    <View style={[styles.battleCard, styles.battleCardChallenger]}>
                      <BattleShieldIcon uri={chShieldUri} accentColor={BATTLE_RED} glowTint="red" />
                      <Text style={styles.battleTeamNameCh} numberOfLines={1} adjustsFontSizeToFit>
                        {challenger.teamName.toUpperCase()}
                      </Text>
                      <BattleScoreAnimated valueSv={challengerScoreSv} />
                      {(phase === 'bonus' || phase === 'surprise' || phase === 'result') && showBonusDetail && (
                        <Text style={styles.scoreBonus}>
                          {t('battles.revealBaseBonus', {
                            base: challenger.baseOverallSum,
                            pct: challenger.nationalityBonusPercent,
                          })}
                        </Text>
                      )}
                    </View>
                  </BattleTeamCardWrap>
                  <View style={styles.battleVsWrap}>
                    <View style={styles.battleVsCircle}>
                      <Text style={styles.battleVsText}>VS</Text>
                    </View>
                  </View>
                  <BattleTeamCardWrap androidGlow="blue">
                    <View style={[styles.battleCard, styles.battleCardChallenged]}>
                      <BattleShieldIcon uri={cdShieldUri} accentColor={BATTLE_BLUE} glowTint="blue" />
                      <Text style={styles.battleTeamNameCd} numberOfLines={1} adjustsFontSizeToFit>
                        {challenged.teamName.toUpperCase()}
                      </Text>
                      <BattleScoreAnimated valueSv={challengedScoreSv} />
                      {(phase === 'bonus' || phase === 'surprise' || phase === 'result') && showBonusDetail && (
                        <Text style={styles.scoreBonus}>
                          {t('battles.revealBaseBonus', {
                            base: challenged.baseOverallSum,
                            pct: challenged.nationalityBonusPercent,
                          })}
                        </Text>
                      )}
                    </View>
                  </BattleTeamCardWrap>
                </View>
                <BattleProgressBar
                  challengerScore={challengerDisplayScore}
                  challengedScore={challengedDisplayScore}
                />
              </View>

              <View style={styles.cardsRow}>
                <CardsColumn
                  slots={chSlots}
                  rowCount={slotRowCount}
                  side="challenger"
                  revealStep={revealStep}
                  heroReveal={heroReveal}
                  accent={BATTLE_RED_BORDER}
                  imageRefs={challengerImageRefs}
                  imageTowardCenter="trailing"
                />
                <BattleSlotVsColumn rowCount={slotRowCount} />
                <CardsColumn
                  slots={cdSlots}
                  rowCount={slotRowCount}
                  side="challenged"
                  revealStep={revealStep}
                  heroReveal={heroReveal}
                  accent={BATTLE_BLUE_BORDER}
                  imageRefs={challengedImageRefs}
                  imageTowardCenter="leading"
                />
              </View>
            </ScrollView>

            {phase === 'bonus' && (
              <View
                style={[
                  styles.bonusBottomSheet,
                  {
                    height: bonusSheetShellH,
                    maxHeight: bonusSheetMaxHeight,
                  },
                ]}
              >
                <View style={styles.bonusBottomSheetHandle} />
                <ScrollView
                  style={styles.bonusBottomSheetScroll}
                  contentContainerStyle={[
                    styles.bonusBottomSheetScrollContent,
                    { paddingBottom: insets.bottom + 10 },
                  ]}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={(_, h) => setBonusSheetContentH(h)}
                >
                  <View style={styles.bonusBottomSheetHeader}>
                    <View style={styles.bonusIconRingCompact}>
                      <Ionicons name="people" size={17} color={palette.yellow[400]} />
                    </View>
                    <Text style={styles.bonusSheetTitle}>{t('battles.revealSynergyTitle')}</Text>
                    <Text style={styles.bonusSheetSubtitle}>{t('battles.revealSynergySubtitle')}</Text>
                  </View>
                  {bonusRevealCount === 0 ? (
                    <View style={styles.bonusInlineLoading}>
                      <ActivityIndicator size="small" color={palette.yellow[400]} />
                      <Text style={styles.bonusSheetLoadingText}>{t('battles.revealSynergyLoading')}</Text>
                    </View>
                  ) : (
                    <View style={styles.bonusTeamStack}>
                      <SynergyTeamBlock
                        compact
                        side="challenger"
                        teamName={challenger.teamName}
                        fullEntries={bonusRevealState.chFull}
                        visibleEntries={bonusRevealState.chVisible}
                        showEmpty={bonusRevealState.chShowEmpty}
                      />
                      <SynergyTeamBlock
                        compact
                        side="challenged"
                        teamName={challenged.teamName}
                        fullEntries={bonusRevealState.cdFull}
                        visibleEntries={bonusRevealState.cdVisible}
                        showEmpty={bonusRevealState.cdShowEmpty}
                      />
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            </>
          )}
        </View>

        {phase === 'surprise' && surpriseSlot ? (
          <View
            style={[styles.phaseCenteredOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            pointerEvents="box-none">
            <View style={styles.phaseCenteredDimSurprise} pointerEvents="auto" />
            <View style={styles.phaseCenteredInner}>
              <View style={styles.surprisePanel}>
                <View style={styles.surpriseHeader}>
                  <View style={styles.surpriseIconRing}>
                    <Ionicons name="gift" size={26} color={palette.yellow[400]} />
                  </View>
                  <Text style={styles.surpriseTitle}>{t('battles.revealSurpriseTitle')}</Text>
                  <Text style={styles.surpriseSubtitle}>{t('battles.revealSurpriseSubtitle')}</Text>
                </View>
                <SurpriseRewardCardPreview slot={surpriseSlot} />
                <Pressable
                  onPress={handleSurpriseContinue}
                  style={({ pressed }) => [styles.surpriseContinueCta, pressed && styles.surpriseContinueCtaPressed]}
                >
                  <Text style={styles.surpriseContinueCtaText}>{t('battles.revealSurpriseContinue')}</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {phase === 'result' && (
          <View
            style={[styles.phaseCenteredOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            pointerEvents="box-none">
            <View style={styles.phaseCenteredDim} pointerEvents="auto" />
            <View style={styles.phaseCenteredInner}>
              <View style={styles.resultPanel}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultIconRing}>
                    <Ionicons name="trophy" size={32} color={palette.yellow[400]} />
                  </View>
                  <Text style={styles.resultEyebrow}>{t('battles.revealResultEyebrow')}</Text>
                  <Text style={styles.resultWinner}>{winnerTeam.teamName}</Text>
                </View>
                <View style={styles.resultScoreBoard}>
                  <View
                    style={[
                      styles.resultScoreSide,
                      winnerSide === 'challenger' ? styles.resultScoreSideHighlight : null,
                    ]}
                  >
                    <Text style={styles.resultScoreNum}>{challenger.overall}</Text>
                    <Text style={styles.resultScoreTeam} numberOfLines={2}>
                      {challenger.teamName}
                    </Text>
                  </View>
                  <View style={styles.resultScoreVsCol}>
                    <Text style={styles.resultScoreVs}>VS</Text>
                  </View>
                  <View
                    style={[
                      styles.resultScoreSide,
                      winnerSide === 'challenged' ? styles.resultScoreSideHighlight : null,
                    ]}
                  >
                    <Text style={styles.resultScoreNum}>{challenged.overall}</Text>
                    <Text style={styles.resultScoreTeam} numberOfLines={2}>
                      {challenged.teamName}
                    </Text>
                  </View>
                </View>
                <Text style={styles.resultSub}>
                  {t('battles.revealFinalScore', {
                    w: winnerTeam.overall,
                    l: loserTeam.overall,
                  })}
                </Text>
                <View style={styles.resultDivider} />
                {viewerWon === true && (
                  <Text style={styles.resultYou}>{t('battles.revealYouWon')}</Text>
                )}
                {viewerWon === false && (
                  <Text style={styles.resultYou}>{t('battles.revealYouLost')}</Text>
                )}
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.resultCta, pressed && styles.resultCtaPressed]}
                >
                  <Text style={styles.resultCtaText}>{t('battles.revealClose')}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

function SurpriseRewardCardPreview({ slot }: { slot: WinnerRevealSlot }) {
  const uri = resolveCardImageUri(slot.imageUrl);
  const nationLabel = slot.nation.trim();
  const flagEmoji = nationLabel ? getFlagEmojiForCountry(nationLabel) : undefined;

  return (
    <View style={styles.surpriseCard}>
      <View style={styles.surpriseCardFrame}>
        <View style={styles.surpriseCardImgWrap}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.surpriseCardImgFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.surpriseCardImgFill, styles.cardImgPh]} />
          )}
          <View style={styles.surpriseCardImgShine} pointerEvents="none" />
          <View style={styles.surpriseCardOvr} pointerEvents="none">
            <Text style={styles.surpriseCardOvrText} allowFontScaling={false}>
              {slot.ovr}
            </Text>
          </View>
        </View>
        <View style={styles.surpriseCardMeta}>
          <Text style={styles.surpriseCardName} numberOfLines={2}>
            {slot.cardName}
          </Text>
          <View style={styles.surpriseCardNationRow}>
            {flagEmoji ? <Text style={styles.surpriseCardFlag}>{flagEmoji}</Text> : null}
            <Text style={styles.surpriseCardNation} numberOfLines={1}>
              {nationLabel || '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SynergyTeamBlock({
  compact,
  side,
  teamName,
  fullEntries,
  visibleEntries,
  showEmpty,
}: {
  compact?: boolean;
  side: 'challenger' | 'challenged';
  teamName: string;
  fullEntries: SynergyEntry[];
  visibleEntries: SynergyEntry[];
  showEmpty: boolean;
}) {
  const accent = side === 'challenger' ? BATTLE_RED_BORDER : BATTLE_BLUE_BORDER;
  const labelColor = side === 'challenger' ? BATTLE_RED : BATTLE_BLUE;

  const cardBg =
    side === 'challenger' ? 'rgba(239, 68, 68, 0.07)' : 'rgba(34, 211, 238, 0.07)';

  const awaitingFirstRow =
    fullEntries.length > 0 && visibleEntries.length === 0 && !showEmpty;
  const awaitingEmptyTeam =
    fullEntries.length === 0 && visibleEntries.length === 0 && !showEmpty;

  const cardStyle = compact ? styles.synergyTeamCardCompact : styles.synergyTeamCard;
  const headerStyle = compact ? styles.synergyTeamCardHeaderCompact : styles.synergyTeamCardHeader;
  const nameStyle = compact ? styles.synergyTeamCardNameCompact : styles.synergyTeamCardName;
  const emptyStyle = compact ? styles.synergyTeamEmptyCompact : styles.synergyTeamEmpty;
  const awaitingStyle = compact ? styles.synergyTeamAwaitingCompact : styles.synergyTeamAwaiting;
  const rowStyle = compact ? styles.synergyRowCompact : styles.synergyRow;
  const nationStyle = compact ? styles.synergyNationCompact : styles.synergyNation;
  const countStyle = compact ? styles.synergyCountCompact : styles.synergyCount;
  const pillStyle = compact ? styles.synergyPctPillCompact : styles.synergyPctPill;
  const pctStyle = compact ? styles.synergyPctTextCompact : styles.synergyPctText;
  const barW = compact ? 3 : 4;
  const barH = compact ? 16 : 22;

  return (
    <View style={[cardStyle, { borderColor: accent + 'AA', backgroundColor: cardBg }]}>
      <View style={headerStyle}>
        <View style={[styles.synergyTeamAccentBar, { backgroundColor: accent, width: barW, height: barH }]} />
        <Text style={[nameStyle, { color: labelColor }]} numberOfLines={1}>
          {teamName.toUpperCase()}
        </Text>
      </View>
      {showEmpty ? (
        <Text style={emptyStyle}>{t('battles.revealNoSynergyTeam')}</Text>
      ) : awaitingFirstRow || awaitingEmptyTeam ? (
        <View style={awaitingStyle}>
          <Text style={styles.synergyTeamAwaitingText}>…</Text>
        </View>
      ) : (
        visibleEntries.map((e, i) => (
          <View
            key={`${side}-${e.nation}-${i}`}
            style={[rowStyle, i === visibleEntries.length - 1 && styles.synergyRowLast]}
          >
            <View style={styles.synergyRowMain}>
              <Text style={nationStyle}>{e.nation}</Text>
              <Text style={countStyle}>×{e.count}</Text>
            </View>
            <View style={pillStyle}>
              <Text style={pctStyle}>+{e.bonusPercent}%</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

/** Mesma proporção da área da foto no slot (compacto vs. reveal hero). */
const HERO_IMG_W = 48;
const HERO_IMG_H = 66;
const HERO_IMG_ASPECT = HERO_IMG_H / HERO_IMG_W;
const HERO_HOLD_MS = 1000;
const HERO_FLIGHT_MS = 100;
const HERO_MAX_IMG_W = 280;

function BattleRevealHeroFly({
  slot,
  accent,
  getImageTarget,
  onDone,
}: {
  slot: WinnerRevealSlot;
  accent: string;
  getImageTarget: () => View | null;
  onDone: () => void;
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const progress = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const sw = useSharedValue(1);
  const sh = useSharedValue(1);
  const ex = useSharedValue(0);
  const ey = useSharedValue(0);
  const ew = useSharedValue(1);
  const eh = useSharedValue(1);
  const getTargetRef = useRef(getImageTarget);
  getTargetRef.current = getImageTarget;

  /** Detalhes (nome, OVR, país) só na fase estática; somem ao iniciar o voo. */
  const [showDetailsOverlay, setShowDetailsOverlay] = useState(false);
  const [heroBottomGradient, setHeroBottomGradient] = useState({ width: 0, height: 0 });

  const uri = resolveCardImageUri(slot.imageUrl);
  const nationLabel = slot.nation.trim();
  const flagEmoji = nationLabel ? getFlagEmojiForCountry(nationLabel) : undefined;

  useEffect(() => {
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      const node = getTargetRef.current();
      if (!node || cancelled) return;
      node.measureInWindow((x, y, w, h) => {
        if (cancelled || w <= 1 || h <= 1) return;
        const largeW = Math.min(HERO_MAX_IMG_W, screenW - 48);
        const largeH = largeW * HERO_IMG_ASPECT;
        sx.value = (screenW - largeW) / 2;
        sy.value = (screenH - largeH) / 2;
        sw.value = largeW;
        sh.value = largeH;
        ex.value = x;
        ey.value = y;
        ew.value = w;
        eh.value = h;
        cancelAnimation(progress);
        progress.value = 0;
        setShowDetailsOverlay(true);
        holdTimer = setTimeout(() => {
          if (cancelled) return;
          setShowDetailsOverlay(false);
          progress.value = withTiming(1, { duration: HERO_FLIGHT_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
            if (finished) runOnJS(onDone)();
          });
        }, HERO_HOLD_MS);
      });
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(measure));
    const t = setTimeout(measure, 100);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      clearTimeout(t);
      if (holdTimer) clearTimeout(holdTimer);
      cancelAnimation(progress);
    };
    // SharedValues estáveis; só remede quando carta/tela muda
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps acima
  }, [slot.slotIndex, screenW, screenH, onDone]);

  const boxStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: interpolate(progress.value, [0, 1], [sx.value, ex.value]),
    top: interpolate(progress.value, [0, 1], [sy.value, ey.value]),
    width: interpolate(progress.value, [0, 1], [sw.value, ew.value]),
    height: interpolate(progress.value, [0, 1], [sh.value, eh.value]),
  }));

  return (
    <View style={styles.heroOverlay} pointerEvents="none">
      <View style={styles.heroBackdrop} />
      <Animated.View style={[styles.heroFlyRoot, { borderColor: accent }, boxStyle]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cardImgPh]} />
        )}
        {showDetailsOverlay ? (
          <View style={styles.heroImgDetailsLayer} pointerEvents="none">
            <View style={styles.heroImgOvrBadge}>
              <Text style={styles.heroImgOvrText} allowFontScaling={false}>
                {slot.ovr}
              </Text>
            </View>
            <View
              style={styles.heroImgBottomGradientWrap}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width > 0 && height > 0) {
                  setHeroBottomGradient({ width, height });
                }
              }}
            >
              {heroBottomGradient.width > 0 && heroBottomGradient.height > 0 ? (
                <Canvas
                  style={{
                    width: heroBottomGradient.width,
                    height: heroBottomGradient.height,
                  }}
                >
                  <Rect x={0} y={0} width={heroBottomGradient.width} height={heroBottomGradient.height}>
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(0, heroBottomGradient.height)}
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.82)']}
                      positions={[0, 0.42, 1]}
                    />
                  </Rect>
                </Canvas>
              ) : null}
            </View>
            <View style={styles.heroImgBottomMeta}>
              <Text style={styles.heroImgPlayerName} numberOfLines={2}>
                {slot.cardName}
              </Text>
              <View style={styles.heroImgNationRow}>
                {flagEmoji ? (
                  <Text style={styles.heroImgFlag} allowFontScaling={false}>
                    {flagEmoji}
                  </Text>
                ) : null}
                <Text style={styles.heroImgNation} numberOfLines={1}>
                  {nationLabel || '—'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const RevealCard = React.memo(function RevealCard({
  slot,
  revealed,
  accent,
  hideImage,
  imageRef,
  imageTowardCenter,
  metaAlign,
}: {
  slot: WinnerRevealSlot;
  revealed: boolean;
  accent: string;
  hideImage?: boolean;
  imageRef?: (el: View | null) => void;
  imageTowardCenter: 'leading' | 'trailing';
  /** Challenger: texto alinhado à direita (em direção ao centro). Challenged: à esquerda. */
  metaAlign: 'start' | 'end';
}) {
  const uri = resolveCardImageUri(slot.imageUrl);
  const nationLabel = slot.nation.trim();
  const flagEmoji = nationLabel ? getFlagEmojiForCountry(nationLabel) : undefined;

  const imgRadiusStyle =
    imageTowardCenter === 'leading' ? styles.cardImgWrapLeading : styles.cardImgWrapTrailing;

  const metaAlignStyle = metaAlign === 'end' ? styles.cardMetaEnd : styles.cardMetaStart;
  const textAlignStyle = metaAlign === 'end' ? styles.cardTextEnd : styles.cardTextStart;

  const metaBlock = (
    <View style={[styles.cardMeta, metaAlignStyle]}>
      <Text style={[styles.cardName, textAlignStyle]} numberOfLines={2}>
        {slot.cardName}
      </Text>
      <View
        style={[
          styles.cardNationRow,
          styles.cardNationRowCentered,
          metaAlign === 'end' ? styles.cardNationRowMirror : null,
        ]}
      >
        {flagEmoji ? <Text style={styles.cardFlagEmoji}>{flagEmoji}</Text> : null}
        <Text style={[styles.cardNation, styles.cardNationCentered]} numberOfLines={1}>
          {nationLabel || '—'}
        </Text>
      </View>
    </View>
  );

  const imageBlock = (
    <View ref={imageRef} style={[styles.cardImgWrap, imgRadiusStyle]} collapsable={false}>
      {hideImage ? (
        <View style={[styles.cardImg, styles.cardImgPh]} />
      ) : uri ? (
        <Image
          source={{ uri }}
          style={styles.cardImg}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.cardImg, styles.cardImgPh]} />
      )}
      <View style={styles.cardOvrOnImage} pointerEvents="none">
        <Text style={styles.cardOvrOnImageText} allowFontScaling={false}>
          {slot.ovr}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.cardWrap, { borderColor: revealed ? accent + 'CC' : colors.cardBorder }]}>
      {!revealed ? (
        <View style={styles.cardBack}>
          <Ionicons name="help" size={22} color={colors.textMuted} />
        </View>
      ) : (
        <View style={styles.cardFrontClip}>
          {imageTowardCenter === 'leading' ? (
            <>
              {imageBlock}
              {metaBlock}
            </>
          ) : (
            <>
              {metaBlock}
              {imageBlock}
            </>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
  },
  backdropIntro: {
    paddingTop: 0,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: 12,
    position: 'relative',
  },
  sheetIntroFull: {
    paddingHorizontal: 0,
  },
  scroll: { flex: 1 },
  introStage: {
    flex: 1,
    minHeight: 360,
    position: 'relative',
    overflow: 'hidden',
  },
  introForeground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  introCenterBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  introNameColumn: {
    alignItems: 'center',
    gap: 22,
    width: '100%',
  },
  introTeamBlockEdge: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  introNameTextWrap: {
    width: '100%',
    paddingHorizontal: 0,
  },
  introNameStack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introNameGlowBackdrop: {
    opacity: 0.42,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 26,
  },
  introNameGlowFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  introShieldFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 12,
  },
  introNameMy: {
    fontSize: 40,
    fontWeight: '900',
    color: palette.red[400],
    textAlign: 'center',
  },
  introNameOpp: {
    fontSize: 40,
    fontWeight: '900',
    color: palette.cyan[400],
    textAlign: 'center',
  },
  introLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  introLeagueLogo: {
    width: '100%',
    height: '100%',
  },
  introBattleStarting: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.textMuted,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  battleHeaderBlock: {
    marginBottom: 18,
  },
  battleCardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    marginBottom: 14,
  },
  battleCardGlowOuter: {
    flex: 1,
    borderRadius: 21,
    padding: 3,
  },
  battleCardGlowOuterRed: {
    backgroundColor: ANDROID_TEAM_CARD_GLOW.red,
  },
  battleCardGlowOuterBlue: {
    backgroundColor: ANDROID_TEAM_CARD_GLOW.blue,
  },
  battleCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    minHeight: 148,
  },
  battleCardChallenger: {
    borderColor: BATTLE_RED_BORDER,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: BATTLE_RED,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
      },
      default: {
        elevation: 0,
      },
    }),
  },
  battleCardChallenged: {
    borderColor: BATTLE_BLUE_BORDER,
    backgroundColor: 'rgba(34, 211, 238, 0.07)',
    ...Platform.select({
      ios: {
        shadowColor: BATTLE_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
      },
      default: {
        elevation: 0,
      },
    }),
  },
  battleTeamNameCh: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: BATTLE_RED,
    textAlign: 'center',
  },
  battleTeamNameCd: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: BATTLE_BLUE,
    textAlign: 'center',
  },
  battleScoreBig: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: '900',
    color: '#f8fafc',
    textAlign: 'center',
  },
  battleScoreBigInput: {
    borderWidth: 0,
    padding: 0,
    width: '100%',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  battleVsWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  battleVsCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: palette.yellow[400],
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.purple[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  battleVsText: {
    fontSize: 13,
    fontWeight: '900',
    color: palette.yellow[400],
    letterSpacing: 1,
  },
  battleShieldFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 10,
      },
      default: {
        elevation: 0,
      },
    }),
  },
  battleShieldAndroidGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  battleBarGlowWrap: {
    width: '100%',
    borderRadius: BATTLE_BAR_R + 4,
    shadowColor: palette.purple[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.52,
    shadowRadius: 26,
    elevation: 12,
  },
  scoreBonus: { fontSize: 10, color: palette.emerald[500], marginTop: 6, textAlign: 'center' },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardCol: { flex: 1, gap: 8 },
  cardSlotPlaceholder: {
    minHeight: HERO_IMG_H,
  },
  cardsVsColumn: {
    width: 28,
    gap: 8,
    alignItems: 'center',
  },
  cardsVsSlot: {
    minHeight: HERO_IMG_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsVsX: {
    fontSize: 22,
    fontWeight: '200',
    color: colors.textMuted,
    lineHeight: 28,
  },
  cardWrap: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: HERO_IMG_H,
    backgroundColor: palette.slate[900],
  },
  cardBack: {
    minHeight: HERO_IMG_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrontClip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: HERO_IMG_H,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImgWrap: {
    width: HERO_IMG_W,
    height: HERO_IMG_H,
    overflow: 'hidden',
    position: 'relative',
  },
  cardOvrOnImage: {
    position: 'absolute',
    left: 3,
    top: 3,
    minWidth: 26,
    height: 24,
    paddingHorizontal: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1.5,
    borderColor: palette.yellow[400],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardOvrOnImageText: {
    fontSize: 11,
    fontWeight: '900',
    color: palette.yellow[400],
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardImgWrapLeading: {
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  cardImgWrapTrailing: {
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  cardImg: { width: HERO_IMG_W, height: HERO_IMG_H },
  cardImgPh: { backgroundColor: palette.slate[700] },
  cardMeta: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    gap: 3,
  },
  cardMetaStart: {
    alignItems: 'flex-start',
  },
  cardMetaEnd: {
    alignItems: 'flex-end',
  },
  cardTextStart: {
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  cardTextEnd: {
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  cardName: { fontSize: 11, fontWeight: '800', color: colors.text },
  cardNationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  },
  /** Bandeira + país centralizados no slot; espelho no desafiante (bandeira mais próxima do VS). */
  cardNationRowCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNationRowMirror: {
    flexDirection: 'row-reverse',
  },
  cardFlagEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  cardNation: {
    flexShrink: 1,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  cardNationCentered: {
    textAlign: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  heroFlyRoot: {
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: palette.slate[900],
  },
  heroImgDetailsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImgOvrBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 2,
    borderColor: palette.yellow[400],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    zIndex: 3,
  },
  heroImgOvrText: {
    fontSize: 20,
    fontWeight: '900',
    color: palette.yellow[400],
  },
  /** Só o rodapé da carta hero: gradiente dissolve até transparente (não cobre metade da foto). */
  heroImgBottomGradientWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
    maxHeight: 118,
    zIndex: 1,
  },
  heroImgBottomMeta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 6,
    zIndex: 2,
    gap: 4,
  },
  heroImgPlayerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroImgNationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroImgFlag: {
    fontSize: 18,
    lineHeight: 22,
  },
  heroImgNation: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  phaseCenteredOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCenteredDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  phaseCenteredDimSurprise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surpriseRevealDim,
  },
  phaseCenteredInner: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bonusBottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 14,
    elevation: 14,
    overflow: 'hidden',
    backgroundColor: palette.slate[950],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      default: {},
    }),
  },
  bonusBottomSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.slate[600],
    marginTop: 8,
    marginBottom: 6,
  },
  bonusBottomSheetScroll: {
    flex: 1,
    flexShrink: 1,
  },
  bonusBottomSheetScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  bonusBottomSheetHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  bonusIconRingCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: palette.yellow[500] + '66',
    backgroundColor: palette.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bonusSheetTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: palette.yellow[400],
    textAlign: 'center',
    letterSpacing: 0.25,
  },
  bonusSheetSubtitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  bonusSheetLoadingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  bonusInlineLoading: {
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  bonusIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: palette.yellow[500] + '66',
    backgroundColor: palette.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bonusTitleMain: {
    fontSize: 19,
    fontWeight: '900',
    color: palette.yellow[400],
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  bonusSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  bonusTeamStack: {
    gap: 8,
    width: '100%',
  },
  bonusLoading: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 12,
  },
  bonusLoadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  synergyTeamCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  synergyTeamCardCompact: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 2,
  },
  synergyTeamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.slate[700],
  },
  synergyTeamCardHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.slate[700],
  },
  synergyTeamAccentBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  synergyTeamCardName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  synergyTeamCardNameCompact: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  synergyTeamEmpty: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  synergyTeamEmptyCompact: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.textMuted,
  },
  synergyTeamAwaiting: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  synergyTeamAwaitingCompact: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  synergyTeamAwaitingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
    opacity: 0.5,
  },
  synergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.slate[700] + 'CC',
  },
  synergyRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.slate[700] + 'CC',
  },
  synergyRowLast: {
    borderBottomWidth: 0,
  },
  synergyRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexShrink: 1,
  },
  synergyNation: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  synergyNationCompact: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  synergyCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  synergyCountCompact: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  synergyPctPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: palette.emerald[900] + 'CC',
    borderWidth: 1,
    borderColor: palette.emerald[500] + '66',
  },
  synergyPctPillCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: palette.emerald[900] + 'CC',
    borderWidth: 1,
    borderColor: palette.emerald[500] + '66',
  },
  synergyPctText: {
    fontSize: 13,
    fontWeight: '900',
    color: palette.emerald[500],
  },
  synergyPctTextCompact: {
    fontSize: 11,
    fontWeight: '900',
    color: palette.emerald[500],
  },
  surprisePanel: {
    width: '100%',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.surpriseModalSurface,
    borderWidth: 1,
    borderColor: colors.hudCardBorderSecondary,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: palette.purple[500],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 22,
      },
      default: {
        elevation: 10,
      },
    }),
  },
  surpriseHeader: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  surpriseIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: palette.yellow[500] + '66',
    backgroundColor: palette.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  surpriseTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: palette.yellow[400],
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  surpriseSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  surpriseCard: {
    width: '100%',
    alignItems: 'center',
  },
  surpriseCardFrame: {
    width: '100%',
    maxWidth: 216,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hudCardBorderSecondary,
    backgroundColor: colors.hudCardBackground,
    ...Platform.select({
      ios: {
        shadowColor: palette.purple[500],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
      },
      android: {
        shadowColor: palette.purple[500],
        elevation: 8,
      },
      default: {
        elevation: 6,
      },
    }),
  },
  surpriseCardImgWrap: {
    width: '100%',
    aspectRatio: 132 / 183,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
  },
  surpriseCardImgFill: {
    ...StyleSheet.absoluteFillObject,
  },
  surpriseCardImgShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
    backgroundColor: palette.yellow[400] + '14',
  },
  surpriseCardOvr: {
    position: 'absolute',
    left: 8,
    top: 8,
    minWidth: 34,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.hudCardBackground,
    borderWidth: 2,
    borderColor: palette.yellow[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  surpriseCardOvrText: {
    fontSize: 14,
    fontWeight: '900',
    color: palette.yellow[400],
  },
  surpriseCardMeta: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.background,
    width: '100%',
  },
  surpriseCardName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  surpriseCardNationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  surpriseCardFlag: {
    fontSize: 20,
    lineHeight: 24,
  },
  surpriseCardNation: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.slate[300],
    textAlign: 'center',
    flexShrink: 1,
  },
  surpriseContinueCta: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: palette.cyan[600],
    borderWidth: 1,
    borderColor: palette.cyan[400] + '99',
    ...Platform.select({
      ios: {
        shadowColor: palette.cyan[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      default: {
        elevation: 4,
      },
    }),
  },
  surpriseContinueCtaPressed: {
    opacity: 0.88,
  },
  surpriseContinueCtaText: { fontSize: 15, fontWeight: '800', color: colors.text },
  resultPanel: {
    width: '100%',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: palette.slate[950],
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: palette.purple[500],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 22,
      },
      default: {
        elevation: 10,
      },
    }),
  },
  resultHeader: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  resultIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: palette.yellow[500] + '55',
    backgroundColor: palette.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resultEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  resultWinner: {
    fontSize: 20,
    fontWeight: '900',
    color: palette.yellow[400],
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  resultScoreBoard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  resultScoreSide: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: palette.slate[900],
    borderWidth: 1,
    borderColor: palette.slate[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultScoreSideHighlight: {
    borderColor: palette.yellow[500] + '99',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  resultScoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  resultScoreTeam: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },
  resultScoreVsCol: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    alignSelf: 'stretch',
  },
  resultScoreVs: {
    fontSize: 12,
    fontWeight: '900',
    color: palette.yellow[500] + 'CC',
    letterSpacing: 0.5,
  },
  resultSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  resultDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.slate[600],
    marginBottom: 14,
  },
  resultYou: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  resultCta: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: palette.cyan[600],
    borderWidth: 1,
    borderColor: palette.cyan[400] + '99',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: palette.cyan[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      default: {
        elevation: 4,
      },
    }),
  },
  resultCtaPressed: {
    opacity: 0.9,
  },
  resultCtaText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
