import { FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeHeader } from './components/header'
import { SearchInput } from './components/search-input'
import type { ProductInterface } from '@/shared/interfaces/product'
import { ProductCard } from './components/product-card'
import type { useHomeViewModel } from './use-home.view-model'

export function HomeView({ products }: ReturnType<typeof useHomeViewModel>) {
  return (
    <SafeAreaView edges={['top']} className="flex-1">
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={({ id }) => `product-list-item-${id}`}
        numColumns={2}
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
      />
    </SafeAreaView>
  )
}
