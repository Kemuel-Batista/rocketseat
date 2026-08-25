import { getOrders } from '@/shared/services/orders.service'
import { useQuery } from '@tanstack/react-query'

export function useGetOrdersQuery() {
  const query = useQuery({
    queryFn: getOrders,
    queryKey: ['user-orders'],
    staleTime: 1000 * 60 * 10,
  })

  return query
}
