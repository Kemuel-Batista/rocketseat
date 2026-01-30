import { SafeAreaView } from 'react-native-safe-area-context'
import { useCartViewModel } from './use-cart.view-model'
import { FlatList } from 'react-native'
import { ProductCartCard } from './components/product-cart-card'
import { EmptyList } from './components/empty-list'
import { CartHeader } from './components/cart-header'
import React from 'react'
import { CartFooter } from './components/cart-footer'

export function CartView({
  products,
  openCartBottomSheet,
  creditCards,
  isLoadingCreditCards,
}: ReturnType<typeof useCartViewModel>) {
  return (
    <SafeAreaView className="flex-1">
      <FlatList
        contentContainerClassName="px-6"
        data={products}
        renderItem={({ item }) => <ProductCartCard product={item} />}
        keyExtractor={({ id }) => `product-cart-id-${id}`}
        ListEmptyComponent={<EmptyList />}
        ListHeaderComponent={<CartHeader />}
        ListFooterComponent={
          products.length > 0 ? (
            <CartFooter
              openCartBottomSheet={openCartBottomSheet}
              creditCards={creditCards}
              isLoadingCreditCards={isLoadingCreditCards}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  )
}
