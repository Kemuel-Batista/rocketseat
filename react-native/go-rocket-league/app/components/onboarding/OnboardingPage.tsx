import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

interface OnboardingPageProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  /** Quando muda, as animações de entrada rodam de novo (cada navegação Next/swipe). */
  pageIndex: number;
}

export function OnboardingPage({
  illustration,
  title,
  description,
  pageIndex,
}: OnboardingPageProps) {
  const illustrationScale = useSharedValue(0.8);
  const illustrationOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const descY = useSharedValue(20);
  const descOpacity = useSharedValue(0);

  useEffect(() => {
    // Reset para estado inicial para a animação rodar de novo
    illustrationScale.value = 0.8;
    illustrationOpacity.value = 0;
    titleY.value = 20;
    titleOpacity.value = 0;
    descY.value = 20;
    descOpacity.value = 0;

    illustrationScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    illustrationOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    titleY.value = withDelay(
      300,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    titleOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    descY.value = withDelay(
      400,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    descOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
  }, [pageIndex, illustrationScale, illustrationOpacity, titleY, titleOpacity, descY, descOpacity]);

  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: illustrationScale.value }],
    opacity: illustrationOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const descAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: descY.value }],
    opacity: descOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.illustrationWrap, illustrationAnimatedStyle]}>
        {illustration}
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          {title}
        </Animated.Text>
        <Animated.Text style={[styles.description, descAnimatedStyle]}>
          {description}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
