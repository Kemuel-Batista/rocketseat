import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFilterViewModel } from "./useFilter.viewModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../styles/colors";
import { AppInput } from "../../../../shared/components/AppInput";
import { AppButton } from "../../../../shared/components/AppButton";
import Checkbox from "expo-checkbox";

export const FilterView: FC<ReturnType<typeof useFilterViewModel>> = ({
  isLoading,
  productsCategory,
  handleCategoryToglle,
  handleValueMaxChange,
  handleValueMinChange,
  selectedCategories,
  handleApplyFilters,
  handleResetFilter,
}) => {
  return (
    <View>
      <View className="flex-row items-center justify-between p-4 px-6">
        <Text className="text-lg font-bold text-gray-900">
          Filtrar anúncios
        </Text>

        <TouchableOpacity>
          <Ionicons name="close" size={20} color={colors["purple-base"]} />
        </TouchableOpacity>
      </View>

      <View className="p-4 px-6">
        <Text className="font-semibold text-base text-gray-300">VALOR</Text>
        <View className="flex-row mb-4 w-[100%]">
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

        <Text className="font-semibold text-base text-gray-300">CATEGORIA</Text>

        {isLoading ? (
          <Text>Carregando categorias...</Text>
        ) : (
          <View className="mb-6 gap-3">
            {productsCategory?.map(({ name, id }) => (
              <TouchableOpacity
                onPress={() => handleCategoryToglle(id)}
                className="flex-row items-center py-2"
                key={`product-cateogry-${id}`}
              >
                <Checkbox
                  value={selectedCategories.includes(id)}
                  onValueChange={() => handleCategoryToglle(id)}
                  color={colors["purple-base"]}
                  className="mr-3 rounded-full"
                />
                <Text className="text-base text-gray-400">{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="flex-row gap-3 mt-4 mb-6">
          <View className="flex-1">
            <AppButton onPress={handleResetFilter} variant="outlined">
              Limpar filtro
            </AppButton>
          </View>
          <View className="flex-1">
            <AppButton onPress={handleApplyFilters}>Filtrar</AppButton>
          </View>
        </View>
      </View>
    </View>
  );
};
