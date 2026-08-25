import { clsx } from 'clsx'
import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { useCreditCardViewModel } from './use-credit-card.view-model'
import type { FocusedField } from '../../use-add-card-bottom-sheet.view-model'
import Animated from 'react-native-reanimated'
import type { CardData } from '.'

interface CreditCardViewProps extends ReturnType<
  typeof useCreditCardViewModel
> {
  focusedField: FocusedField | null
  cardData: CardData
}

const PURPLE_GRADIENT: readonly [string, string, string] = [
  '#5B3A8F',
  '#6B5CA5',
  '#7B6CB5',
]

export function CreditCardView({
  focusedField,
  frontAnimatedStyle,
  backAnimatedStyle,
  formatCardNumber,
  cardData,
}: CreditCardViewProps) {
  return (
    <View className="h-[192px]">
      <Animated.View
        style={[
          frontAnimatedStyle,
          {
            position: 'absolute',
            width: '100%',
            height: 192,
            backfaceVisibility: 'hidden',
          },
        ]}
      >
        <LinearGradient
          colors={PURPLE_GRADIENT}
          start={{ x: 0, y: 0.5 }}
          style={{ flex: 1, borderRadius: 16, padding: 20 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <View className="h-8 w-12 rounded-md bg-yellow-400" />
          </View>

          <View
            className={clsx('mb-6 rounded-lg px-1 py-2', {
              'bg-white/20': focusedField === 'number',
            })}
          >
            <Text className="text-center text-lg tracking-widest text-white">
              {formatCardNumber(cardData.number)}
            </Text>
          </View>

          <View className="flex-row items-end justify-between">
            <View
              className={clsx('flex-1 rounded-lg p-2', {
                'bg-white/20': focusedField === 'name',
              })}
            >
              <Text className="text-sm font-bold uppercase text-white">
                PORTADOR
              </Text>
              <Text className="text-sm font-bold uppercase text-white">
                {cardData.name.length > 0 ? cardData.name : 'NOME DO TITULAR'}
              </Text>
            </View>

            <View
              className={clsx('ml-4 rounded-lg p-1', {
                'bg-white/20': focusedField === 'expiry',
              })}
            >
              <Text className="mb-1 text-xs font-semibold text-white">
                VÁLIDO ATÉ
              </Text>
              <Text className="text-sm font-bold text-white">
                {cardData.expiry.length > 0 ? cardData.expiry : 'MM/AA'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      <Animated.View
        style={[
          backAnimatedStyle,
          {
            position: 'absolute',
            width: '100%',
            height: 192,
            backfaceVisibility: 'hidden',
          },
        ]}
      >
        <LinearGradient
          colors={PURPLE_GRADIENT}
          start={{ x: 0, y: 0.5 }}
          style={{ flex: 1, borderRadius: 16 }}
        >
          <View className="mt-[20px] h-[40px] w-full bg-black" />
          <View className="flex-1 items-end justify-center px-5">
            <View className="w-24">
              <Text className="mb-2 text-xs font-semibold text-white">CVV</Text>

              <View
                className={clsx('h-8 justify-center rounded bg-white p-2', {
                  'bg-blue-100': focusedField === 'cvv',
                })}
              >
                <Text>{cardData.cvv || '...'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}
