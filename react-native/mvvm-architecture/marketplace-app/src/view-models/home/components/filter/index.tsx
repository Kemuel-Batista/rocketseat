import { FilterView } from './filter.view'
import { useFilterViewModel } from './use-filter.view-model'

export function Filter() {
  const props = useFilterViewModel()

  return <FilterView {...props} />
}
