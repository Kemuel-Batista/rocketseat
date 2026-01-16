import { AppInput } from '@/shared/components/app-input'
import { colors } from '@/styles/colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function SearchInput() {
  return (
    <View className="mb-3 mt-6">
      <Text className="mt-6 text-2xl font-bold">Explore Produtos</Text>
      <View className="flex-row">
        <View className="flex-1">
          <AppInput
            leftIcon="search"
            returnKeyType="search"
            className="flex-1 text-lg"
          />
        </View>

        <TouchableOpacity className="ml-5 mt-6 size-[48px] items-center justify-center rounded-lg border border-purple-base">
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
