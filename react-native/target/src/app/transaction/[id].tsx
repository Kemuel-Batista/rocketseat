import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, View } from 'react-native'

import { Button } from '@/components/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/input'
import { PageHeader } from '@/components/page-header'
import { TransactionType } from '@/components/transaction-type'
import { useTransactionsDatabase } from '@/database/use-transactions-database'
import { TransactionTypes } from '@/utils/transaction-types'

export default function Transaction() {
  const [type, setType] = useState(TransactionTypes.Input)
  const [amount, setAmount] = useState(0)
  const [observation, setObservation] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const params = useLocalSearchParams<{ id: string }>()
  const transactionsDatabase = useTransactionsDatabase()

  async function handleCreate() {
    try {
      if (amount <= 0) {
        return Alert.alert(
          'Atenção',
          'Preencha o valor. A transação deve ser maior que zero.',
        )
      }

      setIsCreating(true)

      await transactionsDatabase.create({
        target_id: Number(params.id),
        amount: type === TransactionTypes.Output ? amount * -1 : amount,
        observation,
      })

      Alert.alert('Sucesso', 'Transação salva com sucesso.', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ])

      setIsCreating(false)
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a transação.')
      console.error(error)
      setIsCreating(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <TransactionType selected={type} onChange={setType} />

        <CurrencyInput
          label="Valor (R$)"
          value={amount}
          onChangeValue={setAmount}
        />

        <Input
          value={observation}
          label="Motivo (opcional)"
          placeholder="Ex: Investir em CDB de 110% no banco XPTO"
          onChangeText={setObservation}
        />

        <Button
          title="Salvar"
          onPress={handleCreate}
          isProcessing={isCreating}
        />
      </View>
    </View>
  )
}
