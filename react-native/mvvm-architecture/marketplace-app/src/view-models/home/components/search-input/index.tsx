import { AppInput } from '@/shared/components/app-input'
import { useBottomSheetStore } from '@/shared/store/bottom-sheet-store'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Filter } from '../filter'

interface SearchInputProps {
  inputValue: string
  setSearchInputText: (text: string) => void
}

export function SearchInput({
  inputValue,
  setSearchInputText,
}: SearchInputProps) {
  const { open } = useBottomSheetStore()

  return (
    <View className="mb-3 mt-6">
      <Text className="mt-6 text-2xl font-bold">Explore Produtos</Text>
      <View className="flex-row">
        <View className="flex-1">
          <AppInput
            value={inputValue}
            onChangeText={setSearchInputText}
            placeholder="Pesquisar"
            leftIcon="search"
            returnKeyType="search"
            className="flex-1 text-lg"
          />
        </View>

        <TouchableOpacity
          onPress={() => open({ content: <Filter /> })}
          className="ml-5 mt-6 size-[48px] items-center justify-center rounded-lg border border-purple-base"
        >
          <Ionicons
            name="filter-outline"
            size={24}
            color={colors['purple-base']}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}
