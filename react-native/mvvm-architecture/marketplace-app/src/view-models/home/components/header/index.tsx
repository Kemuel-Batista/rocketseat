import { useUserStore } from '@/shared/store/user-store'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export function HomeHeader() {
  const { user } = useUserStore()

  return (
    <View>
      <TouchableOpacity className="flex-row items-center gap-6">
        <View className="relative">
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user?.avatarUrl }}
              className="size-[56px] rounded-xl border-shape"
            />
          ) : (
            <View className="size-[56px] items-center justify-center rounded-xl border-2 border-gray-200 bg-shape">
              <Ionicons name="person" size={24} color={colors.grays[300]} />
            </View>
          )}
        </View>

        <View>
          <Text className="text-base font-bold">
            Olá, {user?.name.split(' ')[0] || 'Usuário'}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-bold color-purple-base">Ver perfil</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors['purple-base']}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
