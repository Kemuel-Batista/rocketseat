import { Text, View } from 'react-native'

export function CartHeader() {
  return (
    <View className="mb-4 gap-1 py-3">
      <Text className="text-[20px] font-bold text-gray-800">Carrinho</Text>
      <Text className="text-gray-400">Veja seu carrinho de compras</Text>
    </View>
  )
}
