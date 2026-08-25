import { SafeAreaView } from 'react-native-safe-area-context'
import { useOrdersViewModel } from './use-orders.view-model'
import { FlatList } from 'react-native'
import { OrderItem } from './components/order-item'
import { EmptyList } from './components/empty-list'
import { ListHeader } from './components/list-header'
import { OrdersLoading } from './components/orders-loading'
import { OrdersError } from './components/orders-error'

export function OrdersView({
  orders,
  error,
  isLoading,
}: ReturnType<typeof useOrdersViewModel>) {
  if (isLoading) return <OrdersLoading />
  if (error) return <OrdersError />

  return (
    <SafeAreaView edges={['top']} className="flex-1">
      <FlatList
        data={orders}
        contentContainerClassName="px-[16px] pb-[120px]"
        renderItem={({ item: order }) => <OrderItem order={order} />}
        keyExtractor={({ id }) => `order-${id}`}
        ListEmptyComponent={EmptyList}
        ListHeaderComponent={ListHeader}
      />
    </SafeAreaView>
  )
}
