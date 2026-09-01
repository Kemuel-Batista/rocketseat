import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { CollectionViewModeToggle, type ViewMode } from '@/components/CollectionViewModeToggle';
import { MyCollectionEntry } from '@/components/MyCollectionEntry';
import { colors } from '@/theme';
import { t } from '@/i18n';

const SEARCH_ICON_SIZE = 20;
const INPUT_PADDING_LEFT = 12 + SEARCH_ICON_SIZE + 12;

export interface CollectionHeaderProps {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  searchInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'style' | 'placeholder' | 'placeholderTextColor' | 'onFocus' | 'onBlur'>;
  /** When set, shows "Minha Coleção" entry above the search bar */
  collectionStats?: { collected: number};
  onCollectionPress?: () => void;
}

export function CollectionHeader({
  searchValue = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  searchInputProps,
  collectionStats,
  onCollectionPress,
}: CollectionHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('cards.title')}</Text>
          <Text style={styles.subtitle}>{t('cards.subtitle')}</Text>
        </View>
        {onViewModeChange && (
          <CollectionViewModeToggle value={viewMode} onChange={onViewModeChange} />
        )}
      </View>

      {collectionStats != null && onCollectionPress != null && (
        <MyCollectionEntry
          collected={collectionStats.collected}
          onPress={onCollectionPress}
        />
      )}

      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={SEARCH_ICON_SIZE}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            viewMode === 'bySelection'
              ? t('cards.searchTeams')
              : t('cards.searchPlayers')
          }
          placeholderTextColor={colors.textDisabled}
          style={[
            styles.input,
            isFocused && { borderColor: colors.inputFocusBorder },
          ]}
          selectionColor={colors.primaryLight}
          {...searchInputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  searchWrap: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 48,
    paddingLeft: INPUT_PADDING_LEFT,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    fontSize: 16,
    color: colors.text,
  },
});
