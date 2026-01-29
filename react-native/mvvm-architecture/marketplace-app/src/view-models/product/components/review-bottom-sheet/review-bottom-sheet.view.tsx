import { Text, TouchableOpacity, View } from 'react-native'
import { useReviewBottomSheetViewModel } from './use-review-bottom-sheet.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import { AppInput } from '@/shared/components/app-input'
import { AppButton } from '@/shared/components/app-button'

export function ReviewBottomSheetView(
  props: ReturnType<typeof useReviewBottomSheetViewModel>,
) {
  return (
    <View className="rounded-t-2xl bg-background">
      <View className="flex-row items-center justify-between p-6">
        <Text className="text-lg font-bold text-gray-900">Avaliar produto</Text>
        <TouchableOpacity className="size-8 items-center justify-center rounded-[10px] border border-gray-400">
          <Ionicons name="close" size={24} color={colors.grays[400]} />
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <Text className="text-base font-semibold text-gray-300">Nota</Text>
        <View className="mb-6 flex-row items-center gap-2">
          <Ionicons name="star-outline" size={32} />
          <Ionicons name="star-outline" size={32} />
          <Ionicons name="star-outline" size={32} />
          <Ionicons name="star-outline" size={32} />
          <Ionicons name="star-outline" size={32} />
        </View>

        <AppInput
          label="COMENTÁRIO"
          placeholder="Escreva sua avaliação"
          value=""
          multiline
          numberOfLines={8}
          textAlign="left"
          containerClassName="mb-8"
          className="h-[150px]"
        />

        <View className="mb-6 flex-row gap-3">
          <AppButton
            title="Cancelar"
            variant="outlined"
            className="flex-1"
            onPress={() => {}}
          />{' '}
          <AppButton title="Enviar" className="flex-1" onPress={() => {}} />
        </View>
      </View>
    </View>
  )
}
