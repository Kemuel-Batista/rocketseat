/**
 * Ícones Material Community em todas as plataformas.
 * Use os nomes diretos do [Material Community Icons](https://icons.expo.fyi/) (filtrar por MaterialCommunityIcons).
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

export type IconSymbolName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
