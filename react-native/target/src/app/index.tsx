import { router } from 'expo-router'
import { View } from 'react-native'

import { Button } from '@/components/button'
import { HomeHeader } from '@/components/home-header'
import { List } from '@/components/list'
import { Target } from '@/components/target'

const summary = {
  total: 'R$ 2,680,00',
  input: { label: 'Entradas', value: 'R$ 6,184.90' },
  output: { label: 'Saídas', value: '-R$ 883.65' },
}

const targets = [
  {
    id: '1',
    name: 'Comprar Teclado Logitech',
    percentage: '0%',
    current: 'R$ 0,00',
    target: 'R$ 1.000,00',
  },
  {
    id: '2',
    name: 'Comprar Mouse Logitech',
    percentage: '75%',
    current: 'R$ 900,00',
    target: 'R$ 1.000,00',
  },
  {
    id: '3',
    name: 'Fazer uma viagem para o Rio de Janeiro',
    percentage: '75%',
    current: 'R$ 1.200,00',
    target: 'R$ 3.000,00',
  },
]

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <HomeHeader data={summary} />

      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => item.id}
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
