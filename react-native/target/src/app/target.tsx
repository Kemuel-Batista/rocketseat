import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, View } from 'react-native'

import { Button } from '@/components/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/input'
import { PageHeader } from '@/components/page-header'
import { useTargetDatabase } from '@/database/use-target-database'

export default function Target() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)

  const params = useLocalSearchParams<{ id?: string }>()
  const targetDatabase = useTargetDatabase()

  async function handleSave() {
    if (!name.trim() || amount <= 0) {
      return Alert.alert(
        'Atenção',
        'Preencha nome e o valor precisa ser maior que zero.',
      )
    }

    setIsProcessing(true)

    if (params.id) {
      // update
    } else {
      await create()
    }
  }

  async function create() {
    try {
      await targetDatabase.create({
        name,
        amount,
      })

      Alert.alert('Nova meta', 'Meta criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a meta.')
      console.log(error)
      setIsProcessing(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira"
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <Input
          value={name}
          onChangeText={setName}
          label="Nome da marca"
          placeholder="Ex: Viagem para praia, Apple Watch"
        />

        <CurrencyInput
          label="Valor alvo (R$)"
          value={amount}
          onChangeValue={setAmount}
        />

        <Button
          title="Salvar"
          onPress={handleSave}
          isProcessing={isProcessing}
        />
      </View>
    </View>
  )
}
