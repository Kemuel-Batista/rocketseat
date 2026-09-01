import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveIndicatorDot } from '@/components/ActiveIndicatorDot';
import { ActiveIndicatorRadar } from '@/components/ActiveIndicatorRadar';
import { TabBarGradientShimmer } from '@/components/TabBarGradientShimmer';
import { Colors } from '@/constants/theme';
import { palette } from '@/theme';

const TAB_RADIUS = 16;

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => r.name !== 'index');
  const activeRouteKey = state.routes[state.index]?.key;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TabBarGradientShimmer />

      <View style={styles.tabsRow}>
        {routes.map((route) => {
          const focused = route.key === activeRouteKey;
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const label = options.title ?? route.name;
          const iconColor = focused ? Colors.primaryLight : Colors.textDisabled;
          const icon = options.tabBarIcon?.({
            focused,
            color: iconColor,
            size: 24,
          });

          const onPress = () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}>
              <View style={styles.iconWrapper}>
                {focused && <ActiveIndicatorRadar />}
                {icon}
                {focused && (
                  <ActiveIndicatorDot />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.slate[900],
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: TAB_RADIUS,
    position: 'relative',
  },
  tabButtonPressed: {
    opacity: 0.9,
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
