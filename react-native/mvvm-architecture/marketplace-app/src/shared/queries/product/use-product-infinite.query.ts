import { useInfiniteQuery } from '@tanstack/react-query'
import { getProducts } from '../../services/product.service'
import { buildImageUrl } from '@/shared/helpers/build-image-url'
import { FilterState } from '@/shared/store/use-filter-store'

interface ProductsInfinityQueryParams {
  filters?: FilterState
}

export const useProductInfinityQuery = ({
  filters,
}: ProductsInfinityQueryParams) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await getProducts({
          pagination: {
            page: pageParam,
            perPage: 10,
          },
          filters: {
            categoryIds: filters?.selectedCategories || [],
            minValue: filters?.valueMin ?? undefined,
            maxValue: filters?.valueMax ?? undefined,
            searchText: filters?.searchText ?? undefined,
          },
        })

        return response
      } catch (error) {
        throw error
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    },
    initialPageParam: 1,
    queryKey: ['products', filters],
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const products = data?.pages
    .flatMap((page) => page.data)
    .map((product) => ({
      ...product,
      imageUrl: buildImageUrl(product.photo),
    }))

  return {
    products,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  }
}
