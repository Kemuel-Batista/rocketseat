import { View } from 'react-native'

import { HomeHeader } from '@/components/home-header'
import { Target } from '@/components/target'

const summary = {
  total: 'R$ 2,680,00',
  input: { label: 'Entradas', value: 'R$ 6,184.90' },
  output: { label: 'Saídas', value: '-R$ 883.65' },
}

const targets = [
  {
    name: 'Comprar Teclado Logitech',
    percentage: '75%',
    current: 'R$ 900,00',
    target: 'R$ 1.000,00',
  },
]

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <HomeHeader data={summary} />

      <Target data={targets[0]} />
    </View>
  )
}
