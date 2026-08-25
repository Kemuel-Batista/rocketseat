import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { useReviewBottomSheetViewModel } from './use-review-bottom-sheet.view-model'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import { AppInput } from '@/shared/components/app-input'
import { AppButton } from '@/shared/components/app-button'
import { Stars } from './components/stars'

export function ReviewBottomSheetView({
  handleContentChange,
  handleRatingChange,
  ratingForm,
  handleFormSubmit,
  isLoading,
  closeBottomSheet,
}: ReturnType<typeof useReviewBottomSheetViewModel>) {
  return (
    <View className="rounded-t-2xl bg-background">
      <View className="flex-row items-center justify-between p-6">
        <Text className="text-lg font-bold text-gray-900">
          {ratingForm.isEditing ? 'Editar avaliação' : 'Avaliar produto'}
        </Text>
        <TouchableOpacity
          onPress={closeBottomSheet}
          className="size-8 items-center justify-center rounded-[10px] border border-gray-400"
        >
          <Ionicons name="close" size={24} color={colors.grays[400]} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="min-h-[300px] items-center justify-center p-6">
          <ActivityIndicator size="large" color={colors['purple-base']} />
          <Text className="mt-4 text-center text-gray-600">
            Verificando avaliação existente...
          </Text>
        </View>
      ) : (
        <View className="p-6">
          <Text className="text-base font-semibold text-gray-300">Nota</Text>
          <View className="mb-6 flex-row items-center gap-2">
            <Stars
              rating={ratingForm.rating}
              onChangeRating={handleRatingChange}
            />
          </View>

          <AppInput
            onChangeText={handleContentChange}
            label="COMENTÁRIO"
            placeholder={
              ratingForm.isEditing
                ? 'Edite sua avaliação'
                : 'Escreva sua avaliação'
            }
            value={ratingForm.content}
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
              onPress={closeBottomSheet}
            />

            <AppButton
              title={ratingForm.isEditing ? 'Atualizar' : 'Enviar'}
              className="flex-1"
              onPress={handleFormSubmit}
            />
          </View>
        </View>
      )}
    </View>
  )
}
