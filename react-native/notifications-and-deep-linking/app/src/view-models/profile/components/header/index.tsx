import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

interface HeaderProps {
  onLogout: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-shape py-3">
      <TouchableOpacity
        className="flex-row items-center gap-1"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors['purple-base']} />
        <Text className="text-base font-semibold text-purple-base">Voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        className="flex-row items-center gap-1"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text className="text-base text-danger">Sair</Text>
      </TouchableOpacity>
    </View>
  )
}
