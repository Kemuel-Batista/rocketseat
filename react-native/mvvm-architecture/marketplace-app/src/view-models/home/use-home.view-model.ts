import { useProductInfiniteQuery } from '@/shared/queries/product/use-product-infinite.query'

export function useHomeViewModel() {
  const {
    products,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useProductInfiniteQuery()

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

  console.log('Data:', JSON.stringify(products, null, 2))
  console.log('Error:', error)
  console.log('Is Loading:', isLoading)
  return {
    handleLoadMore,
    handleRefresh,
    products,
    handleEndReached,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  }
}
