import { colors } from '@/styles/colors'
import { useRef, useState } from 'react'
import { TextInput, BlurEvent, FocusEvent } from 'react-native'

interface UseAppInputViewModelProps {
  isError?: boolean
  isDisabled?: boolean
  error?: string
  secureTextEntry?: boolean
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: BlurEvent) => void
  mask?: (value: string) => string | void
  onChangeText?: (text: string) => void
  value?: string
}

export function useAppInputViewModel({
  isError,
  isDisabled,
  error,
  secureTextEntry,
  onFocus,
  onBlur,
  mask,
  onChangeText,
  value,
}: UseAppInputViewModelProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<TextInput>(null)

  function handlePasswordToggle() {
    setShowPassword((prev) => !prev)
  }

  function handleWrapperPress() {
    inputRef.current?.focus()
  }

  function handleFocus(event: FocusEvent) {
    setIsFocused(true)
    onFocus?.(event)
  }

  function handleBlur(event: BlurEvent) {
    setIsFocused(false)
    onBlur?.(event)
  }

  function getIconColor() {
    if (isFocused) return colors['purple-base']
    if (isError) return colors.danger
    if (value) return colors['purple-base']

    return colors.grays['200']
  }

  function handleTextChange(text: string) {
    if (mask) {
      onChangeText?.(mask(text) || '')
    } else {
      onChangeText?.(text)
    }
  }

  return {
    isFocused,
    showPassword,
    handlePasswordToggle,
    handleWrapperPress,
    handleFocus,
    handleBlur,
    getIconColor,
    handleTextChange,
  }
}
