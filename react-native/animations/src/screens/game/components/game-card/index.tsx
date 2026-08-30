import { AppText } from '@/components/app-text'
import { colors, gradients } from '@/constants/colors'
import { StoreCard } from '@/shared/utils/challenge'
import { LinearGradient } from 'expo-linear-gradient'
import { FC } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'

interface Params {
  card: StoreCard
  index: number
}

export const GameCard: FC<Params> = ({ card, index }) => {
  return (
    <Animated.View style={[styles.containerWrapper]}>
      <Pressable style={styles.container}>
        <Animated.View style={styles.innerContainer}>
          <Animated.View style={[styles.cardFace]}>
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
          <Animated.View style={[styles.cardFace]}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={gradients.card}
              style={styles.cardGradient}
            >
              <Image source={require('@/assets/logo-transparent.png')} />
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
