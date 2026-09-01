import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SocialButton } from '@/components/onboarding/SocialButton';
import { useToast } from '@/components/toast/ToastContainer';
import { t } from '@/i18n';
import { useAppleLogin } from '@/hooks/useAppleLogin';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { getAvatarsCount, updateUser } from '@/lib/api/userApi';
import { apiConfig } from '@/lib/api/config';
import { useUserStore } from '@/store/userStore';
import { colors, palette } from '@/theme';

const AVATAR_ITEM_SIZE = 64;
const AVATAR_ITEM_MARGIN = 8;
const AVATAR_ITEM_WIDTH = AVATAR_ITEM_SIZE + AVATAR_ITEM_MARGIN * 2;
const FADE_WIDTH = 48;
const CENTER_SCALE = 1.12;
const EDGE_SCALE = 0.88;
const ENTRANCE_OFFSET = 20;
const ENTRANCE_DURATION = 400;
const USERNAME_FIELD_DELAY = 100;

function buildAvatarUri(id: number): string {
  return `${apiConfig.baseUrl}/public_assets/avatars/${id}.webp`;
}

type AvatarListItemProps = {
  id: number;
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  scrollX: SharedValue<number>;
  listWidth: number;
};

function AvatarListItem({
  id,
  index,
  isSelected,
  onSelect,
  scrollX,
  listWidth,
}: AvatarListItemProps) {
  const uri = buildAvatarUri(id);

  const animatedStyle = useAnimatedStyle(() => {
    const itemCenterX = index * AVATAR_ITEM_WIDTH + AVATAR_ITEM_WIDTH / 2;
    const visibleCenterX = scrollX.value + listWidth / 2;
    const distance = Math.abs(itemCenterX - visibleCenterX);
    const maxDistance = listWidth * 0.5;
    const t = Math.min(1, distance / maxDistance);
    const scale = EDGE_SCALE + (CENTER_SCALE - EDGE_SCALE) * (1 - t);
    return { transform: [{ scale }] };
  }, [index, listWidth]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
  }, [id, onSelect]);

  return (
    <Animated.View style={[styles.avatarItemWrap, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.avatarItem,
          pressed && styles.avatarItemPressed,
          isSelected && styles.avatarItemSelected,
        ]}
      >
        <Image source={{ uri }} style={styles.avatarItemImage} contentFit="cover" />
      </Pressable>
    </Animated.View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useToast();
  const isGuest = useUserStore((s) => s.isGuest);
  const email = useUserStore((s) => s.email);
  const username = useUserStore((s) => s.username);
  const avatarId = useUserStore((s) => s.avatarId);
  const setUsername = useUserStore((s) => s.setUsername);
  const setAvatarId = useUserStore((s) => s.setAvatarId);

  const [usernameInput, setUsernameInput] = useState(username ?? '');
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(avatarId ?? null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarsCount, setAvatarsCount] = useState<number>(0);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listWidth, setListWidth] = useState(0);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const { startGoogleLogin, isLoading: isGoogleLoading, error: googleError } = useGoogleLogin({
    onSuccess: () => {
      showSuccess(t('onboarding.googleLinkedMessage', 'Sua conta Google foi vinculada com sucesso.'), {
        title: t('onboarding.googleLinkedTitle', 'Conta vinculada'),
      });
    },
  });

  const { startAppleLogin, isLoading: isAppleLoading, error: appleError } = useAppleLogin({
    onSuccess: () => {
      showSuccess(t('onboarding.appleLinkedMessage'), {
        title: t('onboarding.appleLinkedTitle'),
      });
    },
  });

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

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

  const scrollX = useSharedValue(0);
  const listWidthSv = useSharedValue(0);
  const avatarCountSv = useSharedValue(0);
  const prevCenterIndexSv = useSharedValue(-1);
  const avatarSectionEntrance = useSharedValue(0);
  const usernameFieldEntrance = useSharedValue(0);
  const avatarIds = Array.from({ length: avatarsCount }, (_, i) => i + 1);

  useFocusEffect(
    useCallback(() => {
      avatarSectionEntrance.value = 0;
      usernameFieldEntrance.value = 0;
      const config = { duration: ENTRANCE_DURATION, easing: Easing.out(Easing.cubic) };
      avatarSectionEntrance.value = withTiming(1, config);
      usernameFieldEntrance.value = withDelay(USERNAME_FIELD_DELAY, withTiming(1, config));
    }, [avatarSectionEntrance, usernameFieldEntrance])
  );

  const avatarSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(avatarSectionEntrance.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(avatarSectionEntrance.value, [0, 1], [-ENTRANCE_OFFSET, 0]) },
    ],
  }));

  const usernameFieldAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(usernameFieldEntrance.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(usernameFieldEntrance.value, [0, 1], [-ENTRANCE_OFFSET, 0]) },
    ],
  }));

  useEffect(() => {
    avatarCountSv.value = avatarsCount;
  }, [avatarsCount, avatarCountSv]);

  const triggerCenterHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const onAvatarListLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setListWidth(w);
    listWidthSv.value = w;
  }, [listWidthSv]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      const listW = listWidthSv.value;
      const count = avatarCountSv.value;
      if (listW <= 0 || count <= 0) return;
      const centerX = e.contentOffset.x + listW / 2 - AVATAR_ITEM_WIDTH / 2;
      const centerIndex = Math.round(centerX / AVATAR_ITEM_WIDTH);
      const clamped = Math.max(0, Math.min(count - 1, centerIndex));
      if (clamped !== prevCenterIndexSv.value) {
        prevCenterIndexSv.value = clamped;
        scheduleOnRN(triggerCenterHaptic);
      }
    },
  });

  const displayName = username ?? '';
  const avatarLetter = (usernameInput || displayName || '?').charAt(0).toUpperCase();
  const currentAvatarUri =
    selectedAvatarId != null && selectedAvatarId !== 0
      ? buildAvatarUri(selectedAvatarId)
      : null;

  useEffect(() => {
    if (!showAvatarPicker) return;
    let cancelled = false;
    setLoadingAvatars(true);
    getAvatarsCount()
      .then((count) => {
        if (!cancelled) setAvatarsCount(count);
      })
      .catch(() => {
        if (!cancelled) setAvatarsCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingAvatars(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showAvatarPicker]);

  const handleSave = useCallback(async () => {
    const trimmed = usernameInput.trim();
    const body: { username?: string; avatarId?: number } = {};
    if (trimmed) body.username = trimmed;
    if (selectedAvatarId != null && selectedAvatarId !== 0) body.avatarId = selectedAvatarId;

    setSaving(true);
    try {
      await updateUser(body);
      setUsername(trimmed || null);
      setAvatarId(selectedAvatarId ?? null);
      router.back();
    } catch (e) {
      Alert.alert(
        t('editProfile.saveErrorTitle'),
        e instanceof Error ? e.message : t('editProfile.saveErrorMessage')
      );
    } finally {
      setSaving(false);
    }
  }, [usernameInput, selectedAvatarId, setUsername, setAvatarId, router]);

  const renderAvatarItem = useCallback(
    ({ item: id, index }: { item: number; index: number }) => (
      <AvatarListItem
        id={id}
        index={index}
        isSelected={selectedAvatarId === id}
        onSelect={setSelectedAvatarId}
        scrollX={scrollX}
        listWidth={listWidth}
      />
    ),
    [selectedAvatarId, listWidth, scrollX]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('editProfile.title')}</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
            saving && styles.saveBtnDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="checkmark" size={22} color={colors.text} />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar preview */}
        <Animated.View
          style={[styles.avatarSection, { borderBottomColor: colors.cardBorder }, avatarSectionAnimatedStyle]}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, !currentAvatarUri && { backgroundColor: colors.primary }]}>
                {currentAvatarUri ? (
                  <Image
                    source={{ uri: currentAvatarUri }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                )}
              </View>
              <Pressable
                onPress={() => setShowAvatarPicker((v) => !v)}
                style={({ pressed }) => [
                  styles.avatarEditButton,
                  pressed && styles.avatarEditButtonPressed,
                ]}
              >
                <IconSymbol name="pencil-outline" size={20} color={colors.text} />
              </Pressable>
            </View>
            
          </View>

          {showAvatarPicker && (
            <View style={styles.avatarsListBlock}>
              {loadingAvatars ? (
                <View style={styles.avatarsLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : avatarsCount === 0 ? (
                <Text style={styles.avatarsEmpty}>{t('editProfile.noAvatars')}</Text>
              ) : (
                <View style={styles.avatarsListWrapper} onLayout={onAvatarListLayout}>
                  <Animated.FlatList
                    data={avatarIds}
                    keyExtractor={(id) => String(id)}
                    renderItem={renderAvatarItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={false}
                    snapToInterval={AVATAR_ITEM_WIDTH}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    contentContainerStyle={styles.avatarsListContent}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    getItemLayout={(_, index) => ({
                      length: AVATAR_ITEM_WIDTH,
                      offset: AVATAR_ITEM_WIDTH * index,
                      index,
                    })}
                  />
                  {/* Fade nas extremidades */}
                  {listWidth > 0 && (
                    <>
                      <View style={[styles.avatarListFade, styles.avatarListFadeLeft]} pointerEvents="none">
                        <Canvas style={styles.avatarListFadeCanvas}>
                          <Rect x={0} y={0} width={FADE_WIDTH} height={AVATAR_ITEM_SIZE + 32}>
                            <LinearGradient
                              start={vec(0, 0)}
                              end={vec(FADE_WIDTH, 0)}
                              colors={[colors.background, 'transparent']}
                            />
                          </Rect>
                        </Canvas>
                      </View>
                      <View style={[styles.avatarListFade, styles.avatarListFadeRight]} pointerEvents="none">
                        <Canvas style={styles.avatarListFadeCanvas}>
                          <Rect x={0} y={0} width={FADE_WIDTH} height={AVATAR_ITEM_SIZE + 32}>
                            <LinearGradient
                              start={vec(FADE_WIDTH, 0)}
                              end={vec(0, 0)}
                              colors={[colors.background, 'transparent']}
                            />
                          </Rect>
                        </Canvas>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Username */}
        <Animated.View style={[styles.fieldBlock, usernameFieldAnimatedStyle]}>
          <Text style={styles.label}>{t('editProfile.usernameLabel')}</Text>
          <TextInput
            style={styles.input}
            value={usernameInput}
            onChangeText={setUsernameInput}
            placeholder={t('editProfile.usernamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!saving}
          />
        </Animated.View>

        {/* Guest: botões de login social; não-guest: email (somente leitura) */}
        {isGuest ? (
          <Animated.View style={[styles.socialSection, usernameFieldAnimatedStyle]}>
            <Text style={styles.socialSectionTitle}>{t('editProfile.linkAccountSectionTitle')}</Text>
            <View style={styles.socialButtons}>
              {Platform.OS === 'ios' && appleAvailable && (
                <View style={styles.appleButtonWrap}>
                  {isAppleLoading ? (
                    <View style={styles.appleLoading}>
                      <ActivityIndicator color={colors.text} />
                    </View>
                  ) : (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                      cornerRadius={16}
                      style={styles.appleButton}
                      onPress={() => {
                        if (!isAppleLoading && !isGoogleLoading) void startAppleLogin();
                      }}
                    />
                  )}
                </View>
              )}
              <SocialButton
                icon={
                  <Ionicons name="logo-google" size={20} color={palette.slate[950]} />
                }
                label={t('editProfile.linkWithGoogle')}
                onPress={() => {
                  if (!isGoogleLoading) void startGoogleLogin();
                }}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.fieldBlock, usernameFieldAnimatedStyle]}>
            <Text style={styles.label}>{t('editProfile.emailLabel')}</Text>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={email ?? ''}
              placeholder="—"
              placeholderTextColor={colors.textMuted}
              editable={false}
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: {
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnPressed: {
    opacity: 0.9,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  avatarSection: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  avatarRow: {
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarEditButtonPressed: {
    opacity: 0.9,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
  },
  avatarHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  avatarsListBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  avatarsListWrapper: {
    position: 'relative',
    height: AVATAR_ITEM_SIZE + 24,
  },
  avatarsListContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  avatarListFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    zIndex: 1,
  },
  avatarListFadeLeft: {
    left: 0,
  },
  avatarListFadeRight: {
    right: 0,
  },
  avatarListFadeCanvas: {
    width: FADE_WIDTH,
    height: AVATAR_ITEM_SIZE + 24,
  },
  avatarItemWrap: {
    width: AVATAR_ITEM_WIDTH,
    height: AVATAR_ITEM_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarItem: {
    width: AVATAR_ITEM_SIZE,
    height: AVATAR_ITEM_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarItemPressed: {
    opacity: 0.9,
  },
  avatarItemSelected: {
    borderColor: colors.primary,
  },
  avatarItemImage: {
    width: AVATAR_ITEM_SIZE,
    height: AVATAR_ITEM_SIZE,
    borderRadius: 12,
  },
  avatarsLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  avatarsEmpty: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 16,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputReadOnly: {
    backgroundColor: colors.card,
    color: colors.textMuted,
  },
  socialSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  socialSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
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
});
