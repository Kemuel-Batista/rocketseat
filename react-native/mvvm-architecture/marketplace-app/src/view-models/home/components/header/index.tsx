import { useUserStore } from '@/shared/store/user-store'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export function HomeHeader() {
  const { user } = useUserStore()

  return (
    <View className="padding-16 border-b border-gray-200 bg-white">
      <TouchableOpacity className="flex-row items-center gap-6">
        <View className="relative">
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user?.avatarUrl }}
              className="h-[56px] w-[56px] rounded-[12px] border-shape"
            />
          ) : (
            <View className="h-[56px] w-[56px] items-center  justify-center rounded-[12px] border-2 border-gray-200 bg-gray-200">
              <Ionicons name="person" size={24} color={colors.grays['300']} />
            </View>
          )}
        </View>

        <View>
          <Text className="text-base font-bold">
            Olá, {user?.name.split(' ')[0] || 'Usuário'}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-bold text-purple-base">
              Ver perfil
            </Text>
            <Ionicons
              size={20}
              name="arrow-forward-outline"
              color={colors['purple-base']}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
