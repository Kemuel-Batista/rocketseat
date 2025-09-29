import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

import { Button } from '@/components/button'
import { List } from '@/components/list'
import { PageHeader } from '@/components/page-header'
import { Progress } from '@/components/progress'
import { Transaction, type TransactionProps } from '@/components/transaction'
import { TransactionTypes } from '@/utils/transaction-types'

const details = {
  current: 'R$ 580,00',
  target: 'R$ 1.790,00',
  percentage: 25,
}

const transactions: TransactionProps[] = [
  {
    id: '1',
    value: 'R$ 12,00',
    date: '28/09/2025',
    type: TransactionTypes.Output,
  },
  {
    id: '2',
    value: 'R$ 250,00',
    date: '29/09/2025',
    description: 'CDB de 110% no banco XPTO',
    type: TransactionTypes.Input,
  },
]

export default function InProgress() {
  const params = useLocalSearchParams<{ id: string }>()

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <PageHeader
        title="Apple Watch"
        rightButton={{
          icon: 'edit',
          onPress: () => {},
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction data={item} onRemove={() => {}} />
        )}
        emptyMessage="Nenhuma transação. Toque em uma nova transação para guardar seu primeiro dinheiro aqui!"
      />

      <Button
        title="Nova transação"
        onPress={() => router.navigate(`/transaction/${params.id}`)}
      />
    </View>
  )
}
