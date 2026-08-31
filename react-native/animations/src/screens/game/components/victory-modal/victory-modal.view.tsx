import { useModalAnimation } from '@/animations/hooks/use-modal-animation'
import { usePressAnimation } from '@/animations/hooks/use-press-animation'
import { AppText } from '@/components/app-text'
import { colors, gradients } from '@/constants/colors'
import { useGameStore } from '@/shared/stores/game.store'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'

interface VictoryModalViewProps {
  visible: boolean
  onPlayAgain: () => void
  onGoHistory: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function VictoryModalView({
  visible,
  onPlayAgain,
  onGoHistory,
}: VictoryModalViewProps) {
  const { timeElapsed } = useGameStore()
  const minutes = Math.floor(timeElapsed / 60)
  const seconds = timeElapsed % 60

  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const { close, animatedStyle } = useModalAnimation({ visible })
  const {
    onPressIn,
    onPressOut,
    animatedStyle: playAgainAnimatedStyle,
  } = usePressAnimation()

  const {
    onPressIn: historyOnPressIn,
    onPressOut: historyOnPressOut,
    animatedStyle: historyPressAnimatedStyle,
  } = usePressAnimation()

  const handlePlayAgain = () => {
    close(onPlayAgain)
  }

  const handleGoHistory = () => {
    close(onGoHistory)
  }

  return (
    <Modal visible={visible} transparent>
      <BlurView intensity={10} style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={32}
            color={colors.accent.lightPurple}
          />

          <AppText style={styles.title}>
            Você concluiu o desafio em {timeString}
          </AppText>

          <View style={styles.buttonGlow}>
            <Animated.View style={[playAgainAnimatedStyle]}>
              <LinearGradient
                colors={gradients.colorful}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Pressable
                  onPress={handlePlayAgain}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <AppText style={styles.buttonText}>Jogar novamente</AppText>
                </Pressable>
              </LinearGradient>
            </Animated.View>
          </View>

          <AnimatedPressable
            onPressIn={historyOnPressIn}
            onPressOut={historyOnPressOut}
            style={[styles.secondaryButton, historyPressAnimatedStyle]}
            onPress={handleGoHistory}
          >
            <AppText style={styles.secondaryButtonText}>Ver histórico</AppText>
          </AnimatedPressable>
        </Animated.View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    backgroundColor: colors.grayscale.gray500,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
  },
  title: {
    fontSize: 20,
    color: colors.grayscale.gray100,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Baloo2_800ExtraBold',
  },
  message: {
    fontSize: 16,
    color: colors.grayscale.gray200,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonGradient: {
    borderRadius: 100,
    width: '100%',
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: colors.grayscale.gray100,
    fontFamily: 'Baloo2_800ExtraBold',
  },
  secondaryButton: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.accent.lightPurple,
    fontFamily: 'Baloo2_800ExtraBold',
  },
  buttonGlow: {
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    width: '100%',
  },
})
