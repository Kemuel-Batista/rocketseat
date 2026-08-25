import { useCreateCreditCardMutation } from '@/shared/queries/credit-cards/use-create-credit-card.mutation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { creditCardSchema, type CreditCardFormData } from './credit-card.schema'
import { useBottomSheetStore } from '@/shared/store/bottom-sheet-store'
import { useRef, useState } from 'react'

export type FocusedField = 'number' | 'name' | 'expiry' | 'cvv'

const formatExpirationDateFormApi = (
  dateString: string,
  setError: (message: string) => void,
) => {
  const [month, year] = dateString.split('/').map(Number)

  if (month < 1 || month > 12) {
    setError('Mês inválido')
    throw new Error('Mês inválido')
  }

  if (year < 0 || year > 99) {
    setError('Ano inválido')
    throw new Error('Ano inválido')
  }

  const fullYear = 2000 + year

  const expirationDate = new Date(fullYear, month, 0)

  const isoDate = expirationDate.toISOString().split('T')[0]

  return isoDate
}

export function useAddCardBottomSheetViewModel() {
  const createCreditCardMutation = useCreateCreditCardMutation()

  const { close: closeBottomSheet } = useBottomSheetStore()

  const [focusedField, setFocusedField] = useState<FocusedField | null>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { control, handleSubmit, setError, watch } =
    useForm<CreditCardFormData>({
      resolver: zodResolver(creditCardSchema),
      defaultValues: {
        titularName: '',
        number: '',
        CVV: '',
        expirationDate: '',
      },
    })

  const handleCreateCreditCard = handleSubmit(
    async ({ number, CVV, expirationDate: rawExpirationDate }) => {
      const expirationDate = formatExpirationDateFormApi(
        rawExpirationDate,
        (message) => setError('expirationDate', { message }),
      )
      const cleanedNumber = number.replace(/\D/g, '')

      await createCreditCardMutation.mutateAsync({
        CVV: Number(CVV),
        expirationDate,
        number: cleanedNumber,
      })

      closeBottomSheet()
    },
  )

  const expirationDateMask = (value: string) => {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 2) return cleaned

    const month = cleaned.slice(0, 2)
    const year = cleaned.slice(2)

    if (year.length > 0) {
      return `${month}/${year}`
    }

    return month
  }

  const cardNumberMask = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const handleFieldFocus = (field: FocusedField) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    setFocusedField(field)
  }

  const handleFieldBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFocusedField(null)
    }, 50)
  }

  const isFlipped = focusedField === 'cvv'

  const watchedValues = watch()

  return {
    handleCreateCreditCard,
    control,
    expirationDateMask,
    cardNumberMask,
    isFlipped,
    handleFieldFocus,
    handleFieldBlur,
    focusedField,
    cardData: {
      number: watchedValues.number,
      name: watchedValues.titularName,
      expiry: watchedValues.expirationDate,
      cvv: watchedValues.CVV,
    },
    closeBottomSheet,
  }
}
