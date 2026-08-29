import { HomeHeader } from '@/components/home-header'
import { colors } from '@/constants/colors'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChallengesList } from './components/challenges-list'
import { DifficultySelectionView } from './components/difficulty-selection/difficulty-selecion.view'

export function HomeView() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader />
        <DifficultySelectionView />
        <ChallengesList />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale.gray700,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
})
