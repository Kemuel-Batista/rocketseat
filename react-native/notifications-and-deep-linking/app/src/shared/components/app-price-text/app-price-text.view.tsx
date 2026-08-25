import { Text, View } from 'react-native'
import { useAppPriceTextViewModel } from './use-app-price-text.view-model'

export function AppPriceTextView({
  classNameCurrency,
  classNameValue,
  currencySymbol,
  valueText,
  value,
  formatPrice,
}: ReturnType<typeof useAppPriceTextViewModel> & {
  classNameCurrency?: string
  classNameValue?: string
}) {
  return (
    <View className="flex-row items-baseline">
      <Text className={classNameCurrency ?? 'text-sm text-gray-900'}>
        {currencySymbol}
      </Text>
      <Text className={classNameValue ?? 'text-2xl font-bold text-gray-900'}>
        {' '}
        {valueText}
      </Text>
    </View>
  )
}
