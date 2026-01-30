import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useAddCardBottomSheetViewModel } from './use-add-card-bottom-sheet.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import { AppButton } from '@/shared/components/app-button'
import { AppInputController } from '@/shared/components/app-input-controller'

export function AddCardBottomSheetView({
  handleCreateCreditCard,
  control,
  cardNumberMask,
  expirationDateMask,
}: ReturnType<typeof useAddCardBottomSheetViewModel>) {
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
          <AppInputController
            control={control}
            name="titularName"
            leftIcon="person-outline"
            label="NOME DO TITULAR"
            placeholder="Nome completo"
          />
          <AppInputController
            control={control}
            name="number"
            leftIcon="card-outline"
            label="NÚMERO"
            maxLength={19}
            mask={cardNumberMask}
            placeholder="Número do cartão"
            keyboardType="numeric"
          />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <AppInputController
                control={control}
                name="expirationDate"
                leftIcon="calendar-outline"
                label="VENCIMENTO"
                maxLength={5}
                mask={expirationDateMask}
                placeholder="MM/AA"
              />
            </View>
            <View className="flex-1">
              <AppInputController
                control={control}
                name="CVV"
                maxLength={3}
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
            <AppButton title="Salvar" onPress={handleCreateCreditCard} />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
