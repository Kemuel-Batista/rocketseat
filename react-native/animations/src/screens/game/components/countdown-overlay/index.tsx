import { CountdownOverlayView } from './countdown-overlay.view'
import { useCountdownOverlayViewModel } from './use-countdown-overlay.view-model'

export interface CountdownOverlayProps {
  countdownVisible: boolean
  onComplete: () => void
}

export function CountdownOverlay({
  countdownVisible,
  onComplete,
}: CountdownOverlayProps) {
  const viewModel = useCountdownOverlayViewModel({
    countdownVisible,
    onComplete,
  })

  return <CountdownOverlayView {...viewModel} />
}
