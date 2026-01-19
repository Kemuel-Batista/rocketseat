import type { ProductInterface } from '@/shared/interfaces/product'

interface UseProductCardViewModelParams {
  product: ProductInterface
}

export function useProductCardViewModel({
  product,
}: UseProductCardViewModelParams) {
  const formatProductName = (name: string) => {
    if (name.length > 17) {
      return `${name.slice(0, 17)}...`
    }

    return name
  }

  const displayName = formatProductName(product.name)
  const formatRating = product.averageRating.toFixed(1)

  return { product, displayName, formatRating }
}
