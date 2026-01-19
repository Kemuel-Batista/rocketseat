import { useGetProductCategoriesQuery } from '@/shared/queries/product/use-get-product-categories'

export function useFilterViewModel() {
  const {
    data: productCategories,
    isLoading,
    error,
    refetch,
  } = useGetProductCategoriesQuery()

  return {
    productCategories,
    isLoading,
  }
}
