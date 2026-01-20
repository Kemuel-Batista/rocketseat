import { useGetProductCommentsInfiniteQuery } from '@/shared/queries/product/use-get-product-comments-infinite-query'
import { useGetProductDetailsQuery } from '@/shared/queries/product/use-get-product-details'

interface UseProductViewModelProps {
  productId: number
}

export function useProductViewModel({ productId }: UseProductViewModelProps) {
  const {
    data: productDetails,
    isLoading,
    error,
  } = useGetProductDetailsQuery(productId)

  const {
    comments,
    isLoading: isLoadingComments,
    hasNextPage,
    fetchNextPage,
    refetch,
    error: errorComments,
    isRefetching,
    isFetchingNextPage,
  } = useGetProductCommentsInfiniteQuery(productId)

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleRefetch = () => {
    if (!isRefetching) {
      refetch()
    }
  }

  const handleEndReached = () => {
    handleLoadMore()
  }

  return {
    isLoading,
    productDetails,
    error,
    handleLoadMore,
    handleRefetch,
    handleEndReached,
    isLoadingComments,
    errorComments,
    comments,
    isRefetching,
    isFetchingNextPage,
  }
}
