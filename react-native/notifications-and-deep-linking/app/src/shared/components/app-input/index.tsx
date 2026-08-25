import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native'
import { appInputVariants, type AppInputVariantsProps } from './input.variants'
import { Ionicons } from '@expo/vector-icons'
import { useAppInputViewModel } from './use-app-input.view-model'

export interface AppInputProps extends TextInputProps, AppInputVariantsProps {
  label?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  containerClassName?: string
  error?: string
  mask?: (value: string) => string | void
}

export function AppInput({
  label,
  leftIcon,
  rightIcon,
  containerClassName,
  mask,
  value,
  isError,
  secureTextEntry = false,
  onBlur,
  onFocus,
  onChangeText,
  error,
  isDisabled,
  ...rest
}: AppInputProps) {
  const {
    isFocused,
    showPassword,
    handlePasswordToggle,
    handleWrapperPress,
    handleFocus,
    handleBlur,
    getIconColor,
    handleTextChange,
  } = useAppInputViewModel({
    isError: !!error,
    isDisabled,
    secureTextEntry,
    onFocus,
    onBlur,
    mask,
    onChangeText,
    value,
  })

  const styles = appInputVariants({
    isFocused,
    isDisabled,
    isError: !!error,
  })

  return (
    <View className={styles.container({ className: containerClassName })}>
      <Text className={styles.label()}>{label}</Text>
      <Pressable className={styles.wrapper()}>
        {leftIcon && (
          <Ionicons
            className="mr-3"
            color={getIconColor()}
            name={leftIcon}
            size={22}
          />
        )}

        <TextInput
          onBlur={handleBlur}
          onFocus={handleFocus}
          value={value}
          onChangeText={handleTextChange}
          className={styles.input()}
          secureTextEntry={showPassword}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity activeOpacity={0.7} onPress={handlePasswordToggle}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
            />
          </TouchableOpacity>
        )}
      </Pressable>

      {error && (
        <Text className={styles.error()}>
          <Ionicons name="alert-circle-outline" /> {error}
        </Text>
      )}
    </View>
  )
}
