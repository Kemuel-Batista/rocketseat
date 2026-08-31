import { HistoryView } from '@/screens/history/history.view'
import { useHistoryViewModel } from '@/screens/history/use-history.view-model'

export default function History() {
  const viewModel = useHistoryViewModel()

  return <HistoryView {...viewModel} />
}
