import { colors } from '@/constants/colors'
import { FlatList, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedHistoryCardView } from './components/animated-history-card/animated-history-card.view'
import { ListHeaderView } from './components/list-header/list-header.view'
import type { useHistoryViewModel } from './use-history.view-model'

export function HistoryView({
  matches,
  averageTime,
  totalGames,
}: ReturnType<typeof useHistoryViewModel>) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <FlatList
          data={matches}
          renderItem={({ item, index }) => (
            <AnimatedHistoryCardView match={item} index={index} />
          )}
          keyExtractor={({ id }) => `score-${id}`}
          style={{ width: '100%' }}
          ListHeaderComponent={() => (
            <ListHeaderView totalGames={totalGames} averageTime={averageTime} />
          )}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale.gray700,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
})
