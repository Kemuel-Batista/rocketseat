import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

import { Button } from '@/components/Button'
import { Filter } from '@/components/Filter'
import { Input } from '@/components/Input'
import { Item } from '@/components/Item'
import { FilterStatus } from '@/types/filter-status'

import { styles } from './styles'

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]
const ITEMS = [
  {
    id: '1',
    status: FilterStatus.DONE,
    description: '8 pães',
  },
  {
    id: '2',
    status: FilterStatus.PENDING,
    description: '1 leite integral',
  },
  {
    id: '3',
    status: FilterStatus.PENDING,
    description: '1 Danone',
  },
]

export default function Home() {
  return (
    <View style={styles.container}>
      <Image
        alt="Logo"
        style={styles.logo}
        source={require('@/assets/logo.png')}
      />

      <View style={styles.form}>
        <Input placeholder="O que você precisa comprar?" />
        <Button title="Adicionar" />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter key={status} status={status} isActive />
          ))}

          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={ITEMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onStatus={() => console.log('Status')}
              onRemove={() => console.log('Remove')}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Nenhum item aqui.</Text>
          )}
        />
      </View>
    </View>
  )
}
