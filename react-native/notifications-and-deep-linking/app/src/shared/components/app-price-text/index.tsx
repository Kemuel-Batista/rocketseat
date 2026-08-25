import { useAppPriceTextViewModel } from './use-app-price-text.view-model'
import { AppPriceTextView } from './app-price-text.view'

interface AppPriceTextParams {
  classNameCurrency?: string
  classNameValue?: string
  value: number
}

export function AppPriceText({
  classNameCurrency,
  classNameValue,
  value,
}: AppPriceTextParams) {
  const viewModel = useAppPriceTextViewModel(value)

  return (
    <AppPriceTextView
      {...viewModel}
      classNameCurrency={classNameCurrency}
      classNameValue={classNameValue}
    />
  )
}
