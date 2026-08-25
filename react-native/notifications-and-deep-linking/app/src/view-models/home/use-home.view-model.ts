import { useDebounce } from '@/shared/hooks/use-debounce'
import { useProductInfinityQuery } from '@/shared/queries/product/use-product-infinite.query'
import { useFilterStore } from '@/shared/store/use-filter-store'
import { useState } from 'react'

export function useHomeViewModel() {
  const { appliedFilterState } = useFilterStore()

  const [searchInputText, setSearchInputText] = useState('')
  const currentSearchText = useDebounce(searchInputText)

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useProductInfinityQuery({
    filters: { ...appliedFilterState, searchText: currentSearchText },
  })

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage()
    }
  }

  const handleRefresh = async () => {
    await refetch()
  }

  const handleEndReached = () => {
    handleLoadMore()
  }

  return {
    handleLoadMore,
    handleRefresh,
    products,
    handleEndReached,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    searchInputText,
    setSearchInputText,
  }
}
