import { useState } from 'react'
import { View } from 'react-native'

import { Button } from '@/components/button'
import { CurrencyInput } from '@/components/currency-input'
import { Input } from '@/components/input'
import { PageHeader } from '@/components/page-header'
import { TransactionType } from '@/components/transaction-type'
import { TransactionTypes } from '@/utils/transaction-types'

export default function Transaction() {
  const [type, setType] = useState(TransactionTypes.Input)

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <TransactionType selected={type} onChange={setType} />

        <CurrencyInput label="Valor (R$)" value={0} />

        <Input
          label="Motivo (opcional)"
          placeholder="Ex: Investir em CDB de 110% no banco XPTO"
        />

        <Button title="Salvar" />
      </View>
    </View>
  )
}
