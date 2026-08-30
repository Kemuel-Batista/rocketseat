import { useGameStore } from '@/shared/stores/game.store'
import { StyleSheet, View } from 'react-native'
import { GameCard } from '../game-card'

export const CardGrid = () => {
  const { cards } = useGameStore()
  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <GameCard key={`card-${card.id}`} card={card} index={index} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
})
