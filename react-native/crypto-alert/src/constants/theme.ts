/**
 * Shared layout / typography tokens. Colors come from `@theme/colors`.
 */
import "@/global.css";

import { colors } from "@theme/colors";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.borderStrong,
    textSecondary: colors.textSecondary,
  },
  dark: {
    text: colors.textPrimary,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.borderStrong,
    textSecondary: colors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
