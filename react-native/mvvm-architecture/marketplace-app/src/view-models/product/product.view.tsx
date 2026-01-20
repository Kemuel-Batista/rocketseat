import { FlatList } from 'react-native'
import { useProductViewModel } from './use-product.view-model'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProductHeader } from './components/header'
import { CommentItem } from './components/comment-item'
import { ListFooter } from './components/list-footer'
import { EmptyList } from './components/empty-list'
import { Loading } from './components/loading'
import { ProductError } from './components/error'
import { AddToCardFooter } from './components/add-to-card-footer'

export function ProductView({
  productDetails,
  isLoading,
  error,
  comments,
  isLoadingComments,
  errorComments,
  handleLoadMore,
  handleRefetch,
  handleEndReached,
  isRefetching,
  isFetchingNextPage,
}: ReturnType<typeof useProductViewModel>) {
  if (error) return <ProductError />

  if (isLoading || !productDetails) return <Loading />

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlatList
        data={comments}
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListHeaderComponent={<ProductHeader productDetails={productDetails} />}
        className="px-6"
        onEndReached={handleEndReached}
        onRefresh={handleRefetch}
        refreshing={isRefetching}
        ListFooterComponent={<ListFooter isLoadingMore={isFetchingNextPage} />}
        ListEmptyComponent={<EmptyList isLoadingComments={isLoadingComments} />}
        contentContainerClassName="pb-6"
      />
      <AddToCardFooter product={productDetails} />
    </SafeAreaView>
  )
}
