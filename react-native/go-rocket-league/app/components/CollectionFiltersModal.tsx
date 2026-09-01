import { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OvrRangeSlider } from '@/components/OvrRangeSlider';
import {
  DEFAULT_COLLECTION_FILTERS,
  type CollectionListFilters,
} from '@/lib/collection/collectionListQuery';
import { colors } from '@/theme';
import { t } from '@/i18n';

export type CollectionFiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  initialFilters: CollectionListFilters;
  onApply: (filters: CollectionListFilters) => void;
};

export function CollectionFiltersModal({
  visible,
  onClose,
  initialFilters,
  onApply,
}: CollectionFiltersModalProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<CollectionListFilters>(initialFilters);

  useEffect(() => {
    if (visible) {
      setDraft(initialFilters);
    }
  }, [visible, initialFilters]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  const setOvr = (next: { ovrMin: number; ovrMax: number }) =>
    setDraft((d) => ({ ...d, ovrMin: next.ovrMin, ovrMax: next.ovrMax }));

  return (
    <View style={styles.overlayRoot} accessibilityViewIsModal importantForAccessibility="yes">
      <Pressable
        style={styles.backdropAbs}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
      />
      <View style={[styles.cardColumn, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <Pressable style={styles.cardOuter} onPress={(e) => e.stopPropagation()}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t('collection.filtersTitle')}</Text>

            <Text style={styles.sectionLabel}>{t('collection.filtersOvrSection')}</Text>
            <OvrRangeSlider
              ovrMin={draft.ovrMin}
              ovrMax={draft.ovrMax}
              onChange={setOvr}
            />

            <Text style={styles.sectionLabel}>{t('collection.filtersNation')}</Text>
            <TextInput
              value={draft.nation}
              onChangeText={(nation) => setDraft((d) => ({ ...d, nation }))}
              placeholder={t('collection.filtersNationPlaceholder')}
              placeholderTextColor={colors.textDisabled}
              style={styles.textInput}
              selectionColor={colors.primaryLight}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.sectionLabel}>{t('collection.filtersPosition')}</Text>
            <TextInput
              value={draft.position}
              onChangeText={(position) => setDraft((d) => ({ ...d, position }))}
              placeholder={t('collection.filtersPositionPlaceholder')}
              placeholderTextColor={colors.textDisabled}
              style={styles.textInput}
              selectionColor={colors.primaryLight}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text style={styles.sectionLabel}>{t('collection.filtersSpawnSource')}</Text>
            <TextInput
              value={draft.spawnSource}
              onChangeText={(spawnSource) => setDraft((d) => ({ ...d, spawnSource }))}
              placeholder={t('collection.filtersSpawnSourcePlaceholder')}
              placeholderTextColor={colors.textDisabled}
              style={styles.textInput}
              selectionColor={colors.primaryLight}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                onPress={() => setDraft({ ...DEFAULT_COLLECTION_FILTERS })}
                accessibilityRole="button">
                <Text style={styles.secondaryBtnText}>{t('collection.filtersClear')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  onApply(draft);
                  onClose();
                }}
                accessibilityRole="button">
                <Text style={styles.primaryBtnText}>{t('collection.filtersApply')}</Text>
              </Pressable>
            </View>

            <Pressable style={styles.closeLink} onPress={onClose} accessibilityRole="button">
              <Text style={styles.closeLinkText}>{t('common.close')}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5000,
    elevation: 50,
  },
  backdropAbs: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardColumn: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  cardOuter: {
    backgroundColor: colors.hudCardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashboardBorder,
    maxWidth: 380,
    width: '100%',
    maxHeight: '88%',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 8,
  },
  textInput: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    fontSize: 15,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  btnPressed: {
    opacity: 0.88,
  },
  closeLink: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  closeLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryLight,
  },
});
