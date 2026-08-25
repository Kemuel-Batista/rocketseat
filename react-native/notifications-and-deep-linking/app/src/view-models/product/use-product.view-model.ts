import { useGetProductCommentsInfiniteQuery } from '@/shared/queries/product/use-get-product-comments-infinite-query'
import { useGetProductDetailsQuery } from '@/shared/queries/product/use-get-product-details'
import { useCartStore } from '@/shared/store/cart-store'
import { useModalStore } from '@/shared/store/modal-store'
import { createElement, useEffect } from 'react'
import { AddToCartSuccessModal } from './components/add-to-cart-success-modal'
import { router } from 'expo-router'
import { useBottomSheetStore } from '@/shared/store/bottom-sheet-store'
import { ReviewBottomSheet } from './components/review-bottom-sheet'
import { localNotificationsService } from '@/shared/services/local-notifications.service'

interface UseProductViewModelProps {
  productId: number
  openFeedbackBottomSheet?: boolean
}

export function useProductViewModel({
  productId,
  openFeedbackBottomSheet,
}: UseProductViewModelProps) {
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

  const { addProduct } = useCartStore()
  const { open, close } = useModalStore()
  const { open: openBottomSheet } = useBottomSheetStore()

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

  const onGoToCart = () => {
    router.push('/(private)/(tabs)/cart')
    close()
  }

  const onContinueShopping = () => {
    router.push('/(private)/(tabs)/home')
    close()
  }

  const handleAddToCart = () => {
    if (!productDetails) return

    addProduct({
      id: productDetails.id,
      name: productDetails.name,
      price: productDetails.value,
      image: productDetails.photo,
    })

    localNotificationsService.scheduleCartReminder({
      productName: productDetails.name,
      productId: productDetails.id,
      delayInMinutes: 30,
    })

    open(
      createElement(AddToCartSuccessModal, {
        productName: productDetails.name,
        onGoToCart,
        onClose: close,
        onContinueShopping,
      }),
    )
  }

  const handleOpenReview = () => {
    if (!productDetails) return

    openBottomSheet({
      content: createElement(ReviewBottomSheet, {
        productId: productDetails.id,
      }),
    })
  }

  useEffect(() => {
    if (openFeedbackBottomSheet) {
      handleOpenReview()
    }
  }, [openFeedbackBottomSheet, productDetails])

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
    handleAddToCart,
    handleOpenReview,
  }
}
