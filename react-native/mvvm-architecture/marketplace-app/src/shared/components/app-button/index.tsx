import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native'
import { buttonVariants, type ButtonVariants } from './button.variants'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/styles/colors'

interface AppButtonProps extends TouchableOpacityProps, ButtonVariants {
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  title: string
}

export function AppButton({
  leftIcon,
  rightIcon,
  title,
  variant = 'filled',
  isLoading,
  isDisabled,
  className,
  ...rest
}: AppButtonProps) {
  const contentColor = variant === 'filled' ? colors.white : colors['blue-base']

  const styles = buttonVariants({
    hasIcon: !!leftIcon || !!rightIcon,
    isLoading,
    isDisabled,
    variant,
  })

  function renderContent() {
    if (isLoading) {
      return <ActivityIndicator size={'small'} color={contentColor} />
    }

    return (
      <>
        {leftIcon && <Ionicons name={leftIcon} color={contentColor} />}
        <Text className={styles.text()}>{title}</Text>
        {rightIcon && <Ionicons name={rightIcon} color={contentColor} />}
      </>
    )
  }

  return (
    <TouchableOpacity className={styles.base({ className })} {...rest}>
      {renderContent()}
    </TouchableOpacity>
  )
}
