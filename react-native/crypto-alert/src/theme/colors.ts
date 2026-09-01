/**
 * Design tokens (dark theme default). All UI colors must be imported from `colors`.
 */
export const palette = {
  base: {
    dark: "#000000",
    light: "#ffffff",
  },
  primary: {
    a0: "#9956f6",
    a10: "#a769f8",
    a20: "#b47cf9",
    a30: "#c08ffb",
    a40: "#cca1fc",
    a50: "#d7b4fd",
  },
  surface: {
    a0: "#121212",
    a10: "#282828",
    a20: "#3f3f3f",
    a30: "#575757",
    a40: "#717171",
    a50: "#8b8b8b",
  },
  surfaceTonal: {
    a0: "#1f1925",
    a10: "#342e39",
    a20: "#4a454f",
    a30: "#615c66",
    a40: "#7a757e",
    a50: "#938f96",
  },
  success: {
    a0: "#22946e",
    a10: "#47d5a6",
    a20: "#9ae8ce",
  },
  warning: {
    a0: "#a87a2a",
    a10: "#d7ac61",
    a20: "#ecd7b2",
  },
  danger: {
    a0: "#9c2121",
    a10: "#d94a4a",
    a20: "#eb9e9e",
  },
  info: {
    a0: "#21498a",
    a10: "#4077d1",
    a20: "#92b2e5",
  },
} as const;

/** Scrim / muted fills — alpha lives only here */
const overlayScrim = "rgba(0, 0, 0, 0.55)";
const successSurfaceMuted = "rgba(34, 148, 110, 0.22)";
const dangerSurfaceMuted = "rgba(156, 33, 33, 0.22)";

export const colors = {
  background: palette.surface.a0,
  surface: palette.surface.a10,
  textPrimary: palette.base.light,
  textSecondary: palette.surface.a50,
  textMuted: palette.surface.a40,
  border: palette.surface.a20,
  borderStrong: palette.surface.a30,

  primary: palette.primary.a0,
  onPrimary: palette.base.light,
  primarySubtle: palette.primary.a40,

  resultPanel: palette.surfaceTonal.a10,
  resultText: palette.base.light,
  resultLabelMuted: palette.primary.a40,

  positive: palette.success.a10,
  positiveBg: successSurfaceMuted,
  negative: palette.danger.a10,
  negativeBg: dangerSurfaceMuted,
  error: palette.danger.a10,

  iconMuted: palette.surface.a50,
  overlayScrim,
} as const;

export type AppColors = typeof colors;
