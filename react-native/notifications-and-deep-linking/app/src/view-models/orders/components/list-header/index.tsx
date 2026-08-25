import { Text, View } from 'react-native'

export function ListHeader() {
  return (
    <View className="mb-4 gap-1 py-3">
      <Text className="text-[20px] font-bold text-gray-800">Pedidos</Text>
      <Text className="text-gray-400">
        Confira sua lista de produtos comprados
      </Text>
    </View>
  )
}
