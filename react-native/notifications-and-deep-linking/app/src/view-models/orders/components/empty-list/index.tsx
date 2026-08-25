import { AppButton } from '@/shared/components/app-button'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, View } from 'react-native'

export function EmptyList() {
  return (
    <View className="flex-1 items-center px-20 pt-16">
      <Ionicons name="clipboard-outline" size={80} color={colors.grays[200]} />
      <Text className="my-4 text-center text-xl font-bold text-gray-700">
        Você ainda não tem pedidos
      </Text>
      <Text className="mb-8 text-center text-base text-gray-400">
        Explore o catálogo de produtos e faça sua primeira compra
      </Text>
      <AppButton
        title="Explorar produtos"
        variant="outlined"
        className="w-fit gap-3"
        leftIcon="storefront-outline"
        onPress={() => router.push('/home')}
      />
    </View>
  )
}
