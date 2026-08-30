import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CountdownOverlay } from './components/countdown-overlay'
import { useGameViewModel } from './use-game.view-model'

export function GameView() {
  const { selectedTheme, countdownVisible, handleCountdownComplete } =
    useGameViewModel()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameInfo}>
        <AppText style={styles.title}>{selectedTheme?.title}</AppText>
        <AppText style={styles.subtitle}>
          Encontre todos os pares dentro do tempo!
        </AppText>
      </View>

      <CountdownOverlay
        countdownVisible={countdownVisible}
        onComplete={handleCountdownComplete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale.gray700,
  },
  title: {
    fontSize: 20,
    color: colors.grayscale.gray100,
    fontFamily: 'Baloo2_800ExtraBold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayscale.gray200,
  },
  gameInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
})
