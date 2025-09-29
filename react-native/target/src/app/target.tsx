import { router } from 'expo-router'
import { View } from 'react-native'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { PageHeader } from '@/components/page-header'

export default function Target() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira"
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <Input
          label="Nome da marca"
          placeholder="Ex: Viagem para praia, Apple Watch"
        />
      </View>

      <Button title="Salvar" onPress={() => router.back()} />
    </View>
  )
}
