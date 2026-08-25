import { AddCardBottomSheetView } from './add-card-bottom-sheet.view'
import { useAddCardBottomSheetViewModel } from './use-add-card-bottom-sheet.view-model'

export function AddCardBottomSheet() {
  const viewModel = useAddCardBottomSheetViewModel()

  return <AddCardBottomSheetView {...viewModel} />
}
