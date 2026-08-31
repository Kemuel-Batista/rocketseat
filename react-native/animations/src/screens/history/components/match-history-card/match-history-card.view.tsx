import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { DifficultyIconView } from '@/screens/home/components/difficulty-selection/difficulty-icon/difficulty-icon.view'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import type { FormattedMatch } from '../../use-history.view-model'

interface Params {
  match: FormattedMatch
}

export const MatchHistoryCardView: FC<Params> = ({ match }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title}>{match.category}</AppText>
        <AppText style={styles.position}>{match.position}º</AppText>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoBadge}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={16}
            color={colors.grayscale.gray300}
          />
          <AppText style={styles.infoText}>{match.date}</AppText>
        </View>
        <View style={styles.infoBadge}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={colors.grayscale.gray300}
          />
          <AppText style={styles.infoText}>{match.time}</AppText>
        </View>
        <View style={styles.infoBadge}>
          <DifficultyIconView
            difficulty={match.difficulty}
            inactiveColor={colors.grayscale.gray300}
            color={colors.feedback.info}
            isSelected
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grayscale.gray500,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Baloo2_800ExtraBold',
    color: colors.grayscale.gray100,
    width: '60%',
  },
  position: {
    fontSize: 18,
    fontFamily: 'Baloo2_800ExtraBold',
    color: colors.accent.cyan,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayscale.gray400,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    height: 32,
    gap: 6,
  },
  infoText: {
    lineHeight: 20,
    fontFamily: 'Baloo2_500Medium',
    color: colors.grayscale.gray200,
  },
})
