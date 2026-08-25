import type {
  SelectionOptions,
  SelectionVariant,
} from '@/shared/hooks/use-app-modal'
import { clsx } from 'clsx'
import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '@/styles/colors'

export interface SelectionModalProps {
  title: string
  message?: string
  options: SelectionOptions[]
}

export function SelectionModal({
  title,
  message,
  options,
}: SelectionModalProps) {
  const getButtonClass = (variant: SelectionVariant) =>
    clsx(
      'w-full py-3 px-4 rounded-lg items-center flex-row justify-center mb-2',
      {
        'bg-danger': variant === 'danger',
        'bg-blue-dark': variant === 'secondary',
        'bg-purple-base': variant === 'primary',
      },
    )

  return (
    <View className="mx-auto w-[85%] max-w-sm rounded-xl bg-white p-6 shadow-2xl">
      <View className="items-center">
        <Text className="mb-3 text-lg font-bold text-gray-900">{title}</Text>
      </View>

      {message && (
        <Text className="mb-6 text-center text-base leading-6 text-gray-600">
          {message}
        </Text>
      )}

      <View>
        {options.map((option, index) => (
          <TouchableOpacity
            key={`selection-item-${index}`}
            onPress={option.onPress}
            className={getButtonClass(option.variant ?? 'primary')}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={20}
                color={colors.white}
                className="mr-2"
              />
            )}
            <Text className="font-semibold text-white">{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
