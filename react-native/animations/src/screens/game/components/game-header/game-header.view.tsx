import { usePressAnimation } from '@/animations/hooks/use-press-animation'
import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useGameHeaderViewModel } from './use-game-header.view-model'

interface GameHeaderViewProps {
  onGoBack: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function GameHeaderView({ onGoBack }: GameHeaderViewProps) {
  const {
    timeString,
    isCriticalTime,
    animatedStyle: animatedTimerStyle,
  } = useGameHeaderViewModel()

  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation({
    scaleActive: 0.8,
    width: 48,
  })
  return (
    <View style={styles.container}>
      <AnimatedPressable
        style={[styles.backButton, animatedStyle]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onGoBack}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={32}
          color={colors.grayscale.gray100}
        />
      </AnimatedPressable>

      <Animated.View style={[styles.timerContainer, animatedTimerStyle]}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={20}
          color={isCriticalTime ? colors.feedback.danger : colors.feedback.info}
        />
        <AppText
          style={[styles.timerText, isCriticalTime && styles.timerTextCritical]}
        >
          {timeString}
        </AppText>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grayscale.gray500,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale.gray500,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Baloo2_700Bold',
    color: colors.feedback.info,
  },
  timerTextCritical: {
    color: colors.feedback.danger,
  },
})
