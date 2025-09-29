import { router } from 'expo-router'
import { Button, View } from 'react-native'

import { PageHeader } from '@/components/page-header'

export default function Target() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira"
      />

      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  )
}
