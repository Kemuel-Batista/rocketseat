import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { getDifficultyColor } from '@/shared/utils/difficulty'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { DifficultyIconView } from './difficulty-icon/difficulty-icon.view'
import { useDifficultyViewModel } from './use-difficulty.view-model'

export function DifficultySelectionView() {
  const { difficulties, selectedDifficulty, setSelectedDifficulty } =
    useDifficultyViewModel()

  return (
    <View style={styles.difficultySection}>
      <View style={styles.difficultyHeader}>
        <AppText style={styles.difficultyLabel}>Dificuldade</AppText>
        <View style={styles.timeIndicator}>
          <MaterialCommunityIcons
            name="clock-outline"
            color={colors.feedback.info}
            size={16}
          />
          <AppText>5 min</AppText>
        </View>
      </View>

      <View style={styles.difficultyTabs}>
        {difficulties.map((difficulty) => (
          <Pressable
            style={styles.difficultyTab}
            key={`difficulty-key-${difficulty}`}
            onPress={() => setSelectedDifficulty(difficulty)}
          >
            <View style={styles.difficultyBadge}>
              <DifficultyIconView
                color={getDifficultyColor(difficulty)}
                difficulty={difficulty}
                inactiveColor={colors.grayscale.gray200}
                isSelected={selectedDifficulty === difficulty}
              />
              <AppText>{difficulty}</AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  difficultySection: {
    marginBottom: 24,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 16,
    color: colors.grayscale.gray200,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale.gray500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  difficultyTabs: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 4,
    position: 'relative',
    borderColor: colors.grayscale.gray400,
    borderWidth: 1,
  },
  difficultyTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    gap: 6,
    zIndex: 1,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    borderRadius: '50%',
  },
})
