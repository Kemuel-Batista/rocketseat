import { AppText } from '@/components/app-text'
import { colors } from '@/constants/colors'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CardGrid } from './components/card-grid'
import { CountdownOverlay } from './components/countdown-overlay'
import { DefeatModalView } from './components/defeat-modal/defeat-modal.view'
import { ExitConfirmationModalView } from './components/exit-confirmation-modal/exit-confirmation-modal.view'
import { GameHeaderView } from './components/game-header/game-header.view'
import { VictoryModalView } from './components/victory-modal/victory-modal.view'
import { useGameViewModel } from './use-game.view-model'

export function GameView() {
  const {
    selectedTheme,
    countdownVisible,
    handleCountdownComplete,
    isTimeoutModalVisible,
    handleTryAgain,
    handleGoHome,
    showExitModal,
    handleOpenExitModal,
    handleConfirmExit,
    handleCancelExit,
    showVictoryModal,
  } = useGameViewModel()

  return (
    <SafeAreaView style={styles.container}>
      <GameHeaderView onGoBack={handleOpenExitModal} />

      <View style={styles.gameInfo}>
        <AppText style={styles.title}>{selectedTheme?.title}</AppText>
        <AppText style={styles.subtitle}>
          Encontre todos os pares dentro do tempo!
        </AppText>

        <CardGrid />
      </View>

      <CountdownOverlay
        countdownVisible={countdownVisible}
        onComplete={handleCountdownComplete}
      />

      <DefeatModalView
        visible={isTimeoutModalVisible}
        onTryAgain={handleTryAgain}
        onGoHome={handleGoHome}
      />

      <ExitConfirmationModalView
        visible={showExitModal}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      <VictoryModalView
        visible={showVictoryModal}
        onPlayAgain={handleTryAgain}
        onGoHistory={handleConfirmExit}
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
    marginBottom: 32,
  },
  gameInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
})
