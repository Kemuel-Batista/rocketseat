import dayjs from 'dayjs'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, View } from 'react-native'

import { Button } from '@/components/button'
import { List } from '@/components/list'
import { Loading } from '@/components/loading'
import { PageHeader } from '@/components/page-header'
import { Progress } from '@/components/progress'
import { Transaction, TransactionProps } from '@/components/transaction'
import { useTargetDatabase } from '@/database/use-target-database'
import { useTransactionsDatabase } from '@/database/use-transactions-database'
import { numberToCurrency } from '@/utils/number-to-currency'
import { TransactionTypes } from '@/utils/transaction-types'

export default function InProgress() {
  const [transactions, setTransactions] = useState<TransactionProps[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [details, setDetails] = useState({
    name: '',
    current: 'R$ 0,00',
    target: 'R$ 0,00',
    percentage: 0,
  })
  const params = useLocalSearchParams<{ id: string }>()

  const targetDatabase = useTargetDatabase()
  const transactionsDatabase = useTransactionsDatabase()

  async function fetchTargetDetails() {
    try {
      const response = await targetDatabase.show(Number(params.id))

      setDetails({
        name: response.name,
        current: numberToCurrency(response.current),
        target: numberToCurrency(response.amount),
        percentage: response.percentage,
      })
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da meta.')
      console.log(error)
    }
  }

  async function fetchTransactions() {
    try {
      const response = await transactionsDatabase.listByTargetId(
        Number(params.id),
      )

      setTransactions(
        response.map((item) => ({
          id: String(item.id),
          value: numberToCurrency(item.amount),
          date: dayjs(item.created_at).format('DD/MM/YYYY [às] HH:mm'),
          description: item.observation,
          type:
            item.amount > 0 ? TransactionTypes.Input : TransactionTypes.Output,
        })),
      )
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as transações.')
      console.log(error)
    }
  }

  async function fetchData() {
    const fetchDetailsPromise = fetchTargetDetails()
    const fetchTransactionsPromise = fetchTransactions()

    await Promise.all([fetchDetailsPromise, fetchTransactionsPromise])
    setIsFetching(false)
  }

  function handleTransactionRemove(id: string) {
    Alert.alert('Remover', 'Deseja realmente remover?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => transactionRemove(id) },
    ])
  }

  async function transactionRemove(id: string) {
    try {
      await transactionsDatabase.remove(Number(id))
      fetchData()
      Alert.alert('Transação', 'Transação removida com sucesso!')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a transação.')
      console.log(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, []),
  )

  if (isFetching) {
    return <Loading />
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <PageHeader
        title={details.name}
        rightButton={{
          icon: 'edit',
          onPress: () => router.navigate(`/target?id=${params.id}`),
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction
            data={item}
            onRemove={() => handleTransactionRemove(item.id)}
          />
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
