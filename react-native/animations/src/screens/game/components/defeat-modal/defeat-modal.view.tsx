import { useModalAnimation } from '@/animations/hooks/use-modal-animation'
import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { Modal, Pressable, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'

interface DefeatModalViewProps {
  visible: boolean
  onTryAgain: () => void
  onGoHome: () => void
}

export function DefeatModalView({
  visible,
  onTryAgain,
  onGoHome,
}: DefeatModalViewProps) {
  const { animatedStyle, close } = useModalAnimation({ visible })

  const handleTryAgain = () => {
    close(onTryAgain)
  }

  return (
    <Modal visible={visible} transparent>
      <BlurView intensity={10} tint="dark" style={styles.overlay}>
        <Animated.View style={[animatedStyle, styles.modalContainer]}>
          <Pressable style={styles.closeButton} onPress={onGoHome}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.grayscale.gray100}
            />
          </Pressable>

          <MaterialCommunityIcons
            name="clock-outline"
            size={32}
            color={colors.feedback.danger}
          />

          <AppText style={styles.title}>Ops, seu tempo acabou!</AppText>

          <AppText style={styles.message}>
            O tempo para finalizar o desafio terminou. Que tal tentar de novo?
          </AppText>

          <Pressable style={styles.button} onPress={handleTryAgain}>
            <AppText style={styles.buttonText}>Jogar novamente</AppText>
          </Pressable>
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
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.grayscale.gray400,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    color: colors.grayscale.gray100,
    fontFamily: 'Baloo2_800ExtraBold',
  },
  closeButton: {
    position: 'absolute',
    top: 22,
    right: 22,
  },
})
