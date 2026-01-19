import { Text, TouchableOpacity, View } from 'react-native'
import { useFilterViewModel } from './use-filter.view-model'
import { Ionicons } from '@expo/vector-icons'
import { Checkbox } from 'expo-checkbox'
import { colors } from '@/styles/colors'
import { AppButton } from '@/shared/components/app-button'
import { AppInput } from '@/shared/components/app-input'

export function FilterView({
  productCategories,
  isLoading,
  handleValueMaxChange,
  handleValueMinChange,
  handleCategoryToggle,
  selectedCategories,
}: ReturnType<typeof useFilterViewModel>) {
  return (
    <View>
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-lg font-bold text-gray-900">
          Filtrar anúncios
        </Text>
        <TouchableOpacity>
          <Ionicons name="close" size={20} color={colors['purple-base']} />
        </TouchableOpacity>
      </View>

      <View className="px-6 py-4">
        <Text className="text-base font-semibold text-gray-300">VALOR</Text>
        <View className="mb-4 w-full flex-row">
          <View className="flex-1">
            <AppInput
              onChangeText={(text) => handleValueMinChange(Number(text))}
              placeholder="De"
              keyboardType="numeric"
              containerClassName="w-[90%]"
            />
          </View>
          <View className="flex-1">
            <AppInput
              onChangeText={(text) => handleValueMaxChange(Number(text))}
              placeholder="Até"
              keyboardType="numeric"
              containerClassName="w-[90%]"
            />
          </View>
        </View>

        <Text className="text-base font-semibold text-gray-300">CATEGORIA</Text>

        {isLoading ? (
          <Text>Carregando categorias...</Text>
        ) : (
          <View className="mb-6 gap-3">
            {productCategories?.map(({ name, id }) => (
              <TouchableOpacity
                className="flex-row items-center py-2"
                key={`product-category-${id}`}
                onPress={() => handleCategoryToggle(id)}
              >
                <Checkbox
                  value={selectedCategories.includes(id)}
                  onValueChange={() => handleCategoryToggle(id)}
                  color={colors['purple-base']}
                  className="mr-3 rounded-full"
                />
                <Text className="text-base text-gray-400">{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="mb-6 mt-4 flex-row gap-3">
          <View className="flex-1">
            <AppButton title="Limpar filtro " variant="outlined" />
          </View>
          <View className="flex-1">
            <AppButton title="Filtrar" />
          </View>
        </View>
      </View>
    </View>
  )
}
