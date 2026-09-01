import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Platform, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingPage } from './OnboardingPage';
import { ProgressDots } from './ProgressDots';
import { SocialButton } from './SocialButton';
import { useToast } from '@/components/toast/ToastContainer';
import { t } from '@/i18n';
import { colors, palette } from '@/theme';
import { useAppleLogin } from '@/hooks/useAppleLogin';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

const ILLUSTRATION_SIZE = 256;
const MIN_SWIPE_DISTANCE = 50;

const onboardingImages = {
  1: require('@/assets/onboarding_images/1.png'),
  2: require('@/assets/onboarding_images/2.png'),
  3: require('@/assets/onboarding_images/3.png'),
  4: require('@/assets/onboarding_images/4.png'),
  5: require('@/assets/onboarding_images/5.png'),
} as const;

export interface OnboardingScreenProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

function OnboardingImage({ page }: { page: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <View style={[illStyles.illustrationWrap, { width: ILLUSTRATION_SIZE, height: ILLUSTRATION_SIZE }]}>
      <Image
        source={onboardingImages[page]}
        style={illStyles.onboardingImage}
        contentFit="contain"
      />
    </View>
  );
}

const illStyles = StyleSheet.create({
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingImage: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
  },
});

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useToast();
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = 5;

  const { startGoogleLogin, isLoading: isGoogleLoading, error: googleError } = useGoogleLogin({
    onSuccess: () => {
      showSuccess(t('onboarding.googleLinkedMessage', 'Sua conta Google foi vinculada com sucesso.'), {
        title: t('onboarding.googleLinkedTitle', 'Conta vinculada'),
      });
      onComplete?.();
    },
  });

  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const { startAppleLogin, isLoading: isAppleLoading, error: appleError } = useAppleLogin({
    onSuccess: () => {
      showSuccess(t('onboarding.appleLinkedMessage'), {
        title: t('onboarding.appleLinkedTitle'),
      });
      onComplete?.();
    },
  });

  useEffect(() => {
    if (googleError) {
      showError(googleError.message, {
        title: t('onboarding.googleErrorTitle', 'Erro ao vincular conta'),
      });
    }
  }, [googleError, showError]);

  useEffect(() => {
    if (appleError) {
      showError(appleError.message, {
        title: t('onboarding.appleErrorTitle'),
      });
    }
  }, [appleError, showError]);

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      onComplete?.();
    }
  }, [currentPage, totalPages, onComplete]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  // PanResponder callbacks run on the JS thread, so we call handlers directly.
  // If using Reanimated gesture handlers (worklets), use scheduleOnRN from 'react-native-worklets' instead of runOnJS.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;
          if (dx < -MIN_SWIPE_DISTANCE) {
            goToNextPage();
          } else if (dx > MIN_SWIPE_DISTANCE) {
            goToPrevPage();
          }
        },
      }),
    [goToNextPage, goToPrevPage]
  );

  const pages = useMemo(
    () => [
      { illustration: <OnboardingImage page={1} />, key: 'page1' as const },
      { illustration: <OnboardingImage page={2} />, key: 'page2' as const },
      { illustration: <OnboardingImage page={3} />, key: 'page3' as const },
      { illustration: <OnboardingImage page={4} />, key: 'page4' as const },
      { illustration: <OnboardingImage page={5} />, key: 'final' as const },
    ],
    []
  );

  const isLastPage = currentPage === totalPages - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background effects */}
      <View style={styles.backgroundEffects} pointerEvents="none">
        <View style={[styles.glow, styles.glowCyan]} />
        <View style={[styles.glow, styles.glowBlue]} />
      </View>

      {!isLastPage && (
        <View style={[styles.skipWrap, { top: insets.top + 8 }]}>
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.contentArea} {...panResponder.panHandlers}>
        <View style={styles.pageWrap}>
          {!isLastPage ? (
            <OnboardingPage
              pageIndex={currentPage}
              illustration={pages[currentPage].illustration}
              title={t(`onboarding.${pages[currentPage].key}.title`)}
              description={t(`onboarding.${pages[currentPage].key}.description`)}
            />
          ) : (
            <View style={styles.finalPage}>
              <View style={styles.finalIllustration}>
                {pages[4].illustration}
              </View>
              <View style={styles.finalContent}>
                <Text style={styles.finalTitle}>
                  {t('onboarding.final.title')}
                </Text>
                <Text style={styles.finalDescription}>
                  {t('onboarding.final.description')}
                </Text>
                <View style={styles.socialButtons}>
                  {Platform.OS === 'ios' && appleAvailable && (
                    <View style={styles.appleButtonWrap}>
                      {isAppleLoading ? (
                        <View style={styles.appleLoading}>
                          <ActivityIndicator color={colors.text} />
                        </View>
                      ) : (
                        <AppleAuthentication.AppleAuthenticationButton
                          buttonType={
                            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                          }
                          buttonStyle={
                            AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                          }
                          cornerRadius={16}
                          style={styles.appleButton}
                          onPress={() => {
                            if (!isAppleLoading && !isGoogleLoading) {
                              void startAppleLogin();
                            }
                          }}
                        />
                      )}
                    </View>
                  )}
                  <SocialButton
                    icon={
                      <Ionicons
                        name="logo-google"
                        size={20}
                        color={palette.slate[950]}
                      />
                    }
                    label={t('onboarding.continueWithGoogle')}
                    onPress={() => {
                      if (!isGoogleLoading) {
                        void startGoogleLogin();
                      }
                    }}
                  />
                  <SocialButton
                    icon={
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={colors.text}
                      />
                    }
                    label={t('onboarding.continueAsGuest')}
                    onPress={onComplete}
                    variant="secondary"
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dotsWrap}>
          <ProgressDots total={totalPages} current={currentPage} />
        </View>
        {!isLastPage && (
          <Pressable style={styles.nextButtonWrap} onPress={goNext}>
            <Text style={styles.nextButtonText}>{t('onboarding.next')}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text}
              style={styles.nextButtonIcon}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundEffects: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.4,
  },
  glowCyan: {
    top: '25%',
    right: -128,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  glowBlue: {
    bottom: '25%',
    left: -128,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  skipWrap: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  pageWrap: {
    flex: 1,
  },
  finalPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  finalIllustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
  },
  finalContent: {
    width: '100%',
    maxWidth: 320,
    paddingBottom: 48,
  },
  finalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  socialButtons: {
    gap: 12,
  },
  appleButtonWrap: {
    width: '100%',
    minHeight: 48,
  },
  appleButton: {
    width: '100%',
    height: 48,
  },
  appleLoading: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: palette.slate[800],
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  dotsWrap: {
    marginBottom: 24,
  },
  nextButtonWrap: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 999,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  nextButtonIcon: {
    marginLeft: 0,
  },
});
