/**
 * Theme colors derived from UI_React_para_referencia (Tailwind usage).
 * App uses dark theme only.
 * palette: raw color scales used in the reference app.
 * colors: semantic colors by application (dark).
 */

// --- Palette: Tailwind-style scales used in the reference app ---
export const palette = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  cyan: {
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    800: '#155e75',
    900: '#164e63',
  },
  blue: {
    400: '#60a5fa',
    500: '#3b82f6',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  purple: {
    400: '#c084fc',
    500: '#a855f7',
    800: '#6b21a8',
    900: '#581c87',
  },
  pink: {
    400: '#f472b6',
    500: '#ec4899',
    800: '#9d174d',
    900: '#831843',
  },
  amber: {
    400: '#fbbf24',
    500: '#f59e0b',
    800: '#92400e',
    900: '#78350f',
  },
  yellow: {
    400: '#facc15',
    500: '#eab308',
    800: '#854d0e',
    900: '#713f12',
  },
  green: {
    400: '#4ade80',
    500: '#22c55e',
    800: '#166534',
    900: '#14532d',
  },
  emerald: {
    500: '#10b981',
    800: '#065f46',
    900: '#064e3b',
  },
  red: {
    400: '#f87171',
    500: '#ef4444',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  orange: {
    500: '#f97316',
    800: '#9a3412',
    900: '#7c2d12',
  },
  indigo: {
    500: '#6366f1',
    800: '#3730a3',
    900: '#312e81',
  },
} as const;

// --- Colors by application (semantic), dark only ---
const { slate, cyan, blue, purple, pink, amber, green, red, yellow, orange, emerald } = palette;

export const colors = {
  // Screen & surfaces
  background: slate[950],
  backgroundLight: slate[700],
  card: slate[900],
  cardBorder: slate[800],
  cardBorderSubtle: slate[700],
  overlay: 'rgba(0,0,0,0.8)',
  // Text
  text: '#ffffff',
  textMuted: slate[400],
  textDisabled: slate[500],
  textDisabledStrong: slate[600],
  // Primary (discovery, fuel, main button)
  primary: cyan[500],
  primaryLight: cyan[400],
  primaryGradientStart: cyan[500],
  primaryGradientEnd: blue[500],
  // XP / cards / badges
  secondary: purple[500],
  secondaryLight: purple[400],
  secondaryGradientStart: purple[500],
  secondaryGradientEnd: pink[500],
  // Achievements / legendary
  accent: amber[500],
  accentLight: amber[400],
  // Success / completed / streak
  success: green[500],
  successLight: green[400],
  // Destructive
  destructive: red[500],
  destructiveLight: red[400],
  // Tab bar & icons
  tint: cyan[400],
  icon: slate[400],
  tabIconDefault: slate[400],
  tabIconSelected: cyan[400],
  // Inputs
  inputBackground: slate[900],
  inputBorder: slate[800],
  inputFocusBorder: cyan[500],
  // Dividers / progress
  divider: slate[700],
  progressTrack: slate[800],
  // Rarity
  rarityCommon: slate[600],
  rarityRare: cyan[500],
  rarityEpic: purple[500],
  rarityLegendary: amber[500],
  // Radar
  radarBorder: cyan[400],
  radarBackground: cyan[400],
  // HUD cards (Fuel, XP) – semi-transparent card + bordered
  hudCardBackground: 'rgba(15, 23, 42, 0.9)',
  hudCardBorderPrimary: 'rgba(6, 182, 212, 0.3)',
  hudCardBorderSecondary: 'rgba(168, 85, 247, 0.3)',
  /** Battle surprise modal: dim + purple glass panel (matches purple glow) */
  surpriseRevealDim: 'rgba(12, 4, 28, 0.62)',
  surpriseModalSurface: palette.slate[950],
  // Shimmer / overlay highlights (progress bar, tab bar)
  shimmerOverlay: 'rgba(255, 255, 255, 0.3)',
  shimmerHighlight: 'rgba(255, 255, 255, 0.5)',
  // Map grid overlay
  mapGridLine: 'rgba(34, 211, 238, 0.12)',
  // Map dashboard (bottom panel)
  dashboardBackground: 'rgba(15, 23, 42, 0.7)',
  dashboardBorder: 'rgba(6, 182, 212, 0.2)',
  dashboardProgressTrack: 'rgba(30, 41, 59, 0.5)',
  dashboardScanButtonDisabled: 'rgba(30, 41, 59, 0.5)',
  dashboardScanGlow: 'rgba(34, 211, 238, 0.4)',
  // Map top HUD pills (coin / xp)
  mapHudCoinGradientCenter: `${slate[800]}E0`,
  mapHudCoinGradientEdge: `${slate[900]}F0`,
  mapHudCoinBorder: `${yellow[400]}80`,
  /** CTA “vídeo por moedas” — mesmo tom do pill, leitura forte no mapa */
  mapHudCoinCta: yellow[400],
  mapHudCoinCtaIcon: amber[400],
  mapHudXpGradientCenter: `${slate[800]}E0`,
  mapHudXpGradientEdge: `${slate[900]}F0`,
  mapHudXpBorder: `${green[400]}73`,
  mapHudXpIcon: green[400],
  mapHudXpIconBg: `${emerald[900]}99`,
  mapHudXpIconBorder: `${green[400]}99`,
  // Difficulty labels (region)
  difficultyEasy: green[400],
  difficultyMedium: yellow[400],
  difficultyHard: orange[500],
  difficultyExpert: red[500],
  // Map (custom map style)
  mapLand: '#656972',
  mapLandStroke: '#252a2e',
  mapWater: '#1e2226',
  mapRoad: '#3a4048',
  // Profile screen
  profileCardBackground: 'rgba(6, 182, 212, 0.15)',
  profileCardBorder: 'rgba(6, 182, 212, 0.35)',
  profileCardButtonBackground: 'rgba(15, 23, 42, 0.5)',
  // Profile stat cards (by type)
  statCardTotalCardsBg: `${purple[500]}33`,
  statCardTotalCardsIcon: purple[400],
  statCardAchievementsBg: `${amber[500]}33`,
  statCardAchievementsIcon: amber[400],
  statCardTotalXpBg: `${cyan[500]}33`,
  statCardTotalXpIcon: cyan[400],
  statCardLocationsBg: `${green[500]}33`,
  statCardLocationsIcon: green[400],
  // Toast notifications (solid backgrounds = visual equivalent of ~20% tint over slate-900)

  flagRadarDot: red[500],
  toast: {
    success: {
      primary: emerald[500],
      border: `rgba(16, 185, 129, 0.45)`,
      bg: '#0f373b', // emerald 20% over slate-900
      iconBg: `${emerald[500]}40`,
    },
    error: {
      primary: red[500],
      border: `rgba(239, 68, 68, 0.45)`,
      bg: '#3c202f', // red 20% over slate-900
      iconBg: `${red[500]}40`,
    },
    warning: {
      primary: orange[500],
      border: `rgba(249, 115, 22, 0.45)`,
      bg: '#3e2926', // orange 20% over slate-900
      iconBg: `${orange[500]}40`,
    },
    info: {
      primary: cyan[500],
      border: `rgba(6, 182, 212, 0.45)`,
      bg: '#0d374c', // cyan 20% over slate-900
      iconBg: `${cyan[500]}40`,
    },
    reward: {
      primary: amber[500],
      border: `rgba(245, 158, 11, 0.45)`,
      bg: '#2e2353', // purple 20% over slate-900
      iconBg: `${amber[500]}40`,
    },
    system: {
      primary: slate[400],
      border: `rgba(148, 163, 184, 0.4)`,
      bg: '#212c40', // slate 50% over slate-900
      iconBg: `${slate[500]}60`,
    },
    textTitle: slate[50],
    textMessage: slate[300],
    closeIcon: slate[400],
    progressTrack: slate[800],
    actionRipple: 'rgba(255, 255, 255, 0.3)',
    closeRipple: 'rgba(255, 255, 255, 0.2)',
    actionLabel: '#ffffff',
  },
} as const;
