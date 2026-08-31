import { usePressAnimation } from '@/animations/hooks/use-press-animation'
import { colors } from '@/constants/colors'
import { useAuthStore } from '@/shared/stores/auth.store'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { AppText } from '../app-text'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const HomeHeader = () => {
  const { user } = useAuthStore()

  const pressAnimatedStyle = usePressAnimation({
    scaleActive: 0.8,
  })

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View>
            <AppText style={styles.greeting}>
              Boas vindas, {user?.name}!
            </AppText>
            <AppText style={styles.subtitle}>
              Comece a jogar selecionando os desafios abaixo!
            </AppText>
          </View>
        </View>
        <View style={{ width: 40 }}>
          <AnimatedPressable
            style={[styles.trophyContainer, pressAnimatedStyle.animatedStyle]}
            onPressIn={pressAnimatedStyle.onPressIn}
            onPressOut={pressAnimatedStyle.onPressOut}
            onPress={() => router.push('/history')}
          >
            <MaterialCommunityIcons
              name="trophy-outline"
              size={20}
              color={colors.accent.lightPurple}
            />
          </AnimatedPressable>
        </View>
      </View>
    </View>
  )
}

export const styles = StyleSheet.create({
  header: {
    paddingTop: 32,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    maxWidth: '70%',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Baloo2_800ExtraBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayscale.gray200,
    lineHeight: 20,
  },
  trophyContainer: {
    width: 40,
    height: 40,
    borderColor: colors.grayscale.gray400,
    borderRadius: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grayscale.gray500,
  },
})
