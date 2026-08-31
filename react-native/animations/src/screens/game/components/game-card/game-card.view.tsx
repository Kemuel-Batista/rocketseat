import { useCardSelectionAnimation } from '@/animations/hooks/use-card-selection-animation'
import { AppText } from '@/components/app-text'
import { colors, gradients } from '@/constants/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { Image, Pressable, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import type { useGameCardViewModel } from './use-game-card.view-model'

export function GameCardView({
  card,
  backAnimatedStyle,
  frontAnimatedStyle,
  selectCard,
  entry,
  shakeAnimatedStyle,
  successAnimatedStyle,
  timeoutAnimatedStyle,
}: ReturnType<typeof useGameCardViewModel>) {
  const {
    animatedStyle: selectionAnimatedStyle,
    onPressIn,
    onPressOut,
  } = useCardSelectionAnimation()

  return (
    <Animated.View
      style={[
        styles.containerWrapper,
        entry.animatedStyle,
        selectionAnimatedStyle,
        shakeAnimatedStyle,
        successAnimatedStyle,
        timeoutAnimatedStyle,
      ]}
    >
      <Pressable
        style={styles.container}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => selectCard(card.id)}
      >
        <Animated.View style={styles.innerContainer}>
          <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={gradients.card}
              style={styles.cardGradient}
            >
              <Image source={require('@/assets/logo-transparent.png')} />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={gradients.card}
              style={styles.cardGradient}
            >
              <Image source={card.image} style={styles.cardImage} />
              <AppText style={styles.cardText}>{card.name}</AppText>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  containerWrapper: {
    width: '32%',
    height: 130,
    marginBottom: 8,
    borderColor: colors.grayscale.gray400,
    borderWidth: 1,
    borderRadius: 16,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardFace: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
    width: '100%',
    height: '100%',
    borderColor: colors.grayscale.gray400,
    borderWidth: 1,
    borderRadius: 16,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cardImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  cardText: {
    color: colors.grayscale.gray100,
    fontSize: 16,
  },
})
