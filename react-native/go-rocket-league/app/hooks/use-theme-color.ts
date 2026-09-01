/**
 * Returns a theme color by name. App uses dark theme only.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  const colorFromProps = props.dark ?? props.light;
  return colorFromProps ?? Colors[colorName];
}
