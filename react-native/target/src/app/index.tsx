import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, StatusBar, View } from 'react-native'

import { Button } from '@/components/button'
import { HomeHeader, type HomeHeaderProps } from '@/components/home-header'
import { List } from '@/components/list'
import { Loading } from '@/components/loading'
import { Target } from '@/components/target'
import {
  type TargetResponse,
  useTargetDatabase,
} from '@/database/use-target-database'
import { useTransactionsDatabase } from '@/database/use-transactions-database'
import { numberToCurrency } from '@/utils/number-to-currency'

export default function Index() {
  const [isFetching, setIsFetching] = useState(true)
  const [summary, setSummary] = useState<HomeHeaderProps>()
  const [targets, setTargets] = useState<TargetResponse[]>([])

  const targetDatabase = useTargetDatabase()
  const transactionsDatabase = useTransactionsDatabase()

  async function fetchTargets(): Promise<TargetResponse[]> {
    try {
      return await targetDatabase.listBySavedValue()
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as metas.')
      console.log(error)
    }
  }

  async function fetchSummary(): Promise<HomeHeaderProps> {
    try {
      const response = await transactionsDatabase.summary()

      return {
        total: numberToCurrency(response.input + response.output),
        input: {
          label: 'Entradas',
          value: numberToCurrency(response.input),
        },
        output: {
          label: 'Saídas',
          value: numberToCurrency(response.output),
        },
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o resumo.')
      console.log(error)
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargets()
    const dataSummaryPromise = fetchSummary()

    const [targetData, dataSummary] = await Promise.all([
      targetDataPromise,
      dataSummaryPromise,
    ])

    setTargets(targetData)
    setSummary(dataSummary)

    setIsFetching(false)
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
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />

      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Target
            data={item}
            onPress={() => router.navigate(`/in-progress/${item.id}`)}
          />
        )}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />

      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova meta" onPress={() => router.navigate('/target')} />
      </View>
    </View>
  )
}
