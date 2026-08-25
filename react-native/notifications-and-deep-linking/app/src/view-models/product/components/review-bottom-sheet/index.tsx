import { ReviewBottomSheetView } from './review-bottom-sheet.view'
import { useReviewBottomSheetViewModel } from './use-review-bottom-sheet.view-model'

interface ReviewBottomSheetProps {
  productId: number
}

export function ReviewBottomSheet({ productId }: ReviewBottomSheetProps) {
  const viewModel = useReviewBottomSheetViewModel(productId)

  return <ReviewBottomSheetView {...viewModel} />
}
