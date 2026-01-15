import type { Ionicons } from '@expo/vector-icons'
import { useModalStore } from '../store/modal-store'
import { createElement } from 'react'
import {
  SelectionModal,
  type SelectionModalProps,
} from '../components/modals/selection-modal'

export type SelectionVariant = 'primary' | 'secondary' | 'danger'

export interface SelectionOptions {
  text: string
  onPress: () => void
  icon?: keyof typeof Ionicons.glyphMap
  variant?: SelectionVariant
}

export function useAppModal() {
  const { open, close } = useModalStore()

  function showSelection({
    title,
    message,
    options,
  }: {
    title: string
    message?: string
    options: SelectionOptions[]
  }) {
    open(
      createElement(SelectionModal, {
        title,
        message,
        options,
      } as SelectionModalProps),
    )
  }

  return {
    showSelection,
  }
}
