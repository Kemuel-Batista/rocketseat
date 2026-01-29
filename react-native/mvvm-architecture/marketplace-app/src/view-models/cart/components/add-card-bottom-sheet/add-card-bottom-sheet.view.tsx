import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useAddCardBottomSheetViewModel } from './use-add-card-bottom-sheet.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import { AppInput } from '@/shared/components/app-input'
import { AppButton } from '@/shared/components/app-button'

export function AddCardBottomSheetView(
  props: ReturnType<typeof useAddCardBottomSheetViewModel>,
) {
  return (
    <ScrollView className="flex-1">
      <View className="p-8">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-500">
            Adicionar cartão
          </Text>
          <TouchableOpacity className="w-8 items-center justify-center rounded-[10px] border border-gray-400">
            <Ionicons
              name="close-outline"
              size={24}
              color={colors.grays[400]}
            />
          </TouchableOpacity>
        </View>

        <View className="mt-6 gap-4">
          <AppInput
            leftIcon="person-outline"
            label="NOME DO TITULAR"
            placeholder="Nome completo"
          />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <AppInput
                leftIcon="calendar-outline"
                label="VENCIMENTO"
                placeholder="MM/AA"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View className="flex-1">
              <AppInput
                leftIcon="lock-closed-outline"
                label="CVV"
                placeholder="000"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View className="mt-8 flex-row gap-4 pb-5">
          <View className="flex-1">
            <AppButton title="Cancelar" variant="outlined" />
          </View>
          <View className="flex-1">
            <AppButton title="Salvar" />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
