import { FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeHeader } from './components/header'
import { SearchInput } from './components/search-input'
import { ProductCard } from './components/product-card'
import type { useHomeViewModel } from './use-home.view-model'
import { Footer } from './components/footer'
import { colors } from '@/styles/colors'

export function HomeView({
  products,
  handleEndReached,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  handleRefresh,
  isRefetching,
}: ReturnType<typeof useHomeViewModel>) {
  return (
    <SafeAreaView edges={['top']} className="flex-1">
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={({ id }) => `product-list-item-${id}`}
        numColumns={2}
        ListFooterComponent={
          <Footer
            isLoading={hasNextPage && Boolean(isLoading || isFetchingNextPage)}
          />
        }
        onEndReached={handleEndReached}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        ListHeaderComponent={() => (
          <>
            <HomeHeader />
            <SearchInput />
          </>
        )}
        contentContainerClassName="px-[16px] pb-[120px]"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            colors={[colors['purple-base']]}
            tintColor={colors['purple-base']}
            onRefresh={handleRefresh}
          />
        }
      />
    </SafeAreaView>
  )
}
