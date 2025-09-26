import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { Button } from '@/components/Button'
import { Filter } from '@/components/Filter'
import { Input } from '@/components/Input'
import { Item } from '@/components/Item'
import { itemsStorage, ItemStorage } from '@/storage/items-storage'
import { FilterStatus } from '@/types/filter-status'

import { styles } from './styles'

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]

export default function Home() {
  const [filter, setFilter] = useState(FilterStatus.PENDING)
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<ItemStorage[]>([])

  async function handleAdd() {
    if (!description.trim()) {
      return Alert.alert('Adicionar', 'Informe a descrição para adicionar ')
    }

    const newItem = {
      id: Math.random().toString(36).substring(2),
      description,
      status: FilterStatus.PENDING,
    }

    await itemsStorage.add(newItem)
    await itemsByStatus()

    setFilter(FilterStatus.PENDING)
    Alert.alert('Adicionado', `Adicionado ${description}`)
    setDescription('')
  }

  async function itemsByStatus() {
    try {
      const response = await itemsStorage.getByStatus(filter)
      setItems(response)
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível filtrar os itens')
    }
  }

  async function handleRemove(id: string) {
    try {
      await itemsStorage.remove(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert('Remover', 'Não foi possível remover.')
    }
  }

  function handleClear() {
    Alert.alert('Limpar', 'Deseja remover todos?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => onClear() },
    ])
  }

  async function onClear() {
    try {
      await itemsStorage.clear()
      setItems([])
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível remover todos os itens.')
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemsStorage.toggleStatus(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível atualizar o status.')
    }
  }

  useEffect(() => {
    itemsByStatus()
  }, [filter])

  return (
    <View style={styles.container}>
      <Image
        alt="Logo"
        style={styles.logo}
        source={require('@/assets/logo.png')}
      />

      <View style={styles.form}>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="O que você precisa comprar?"
        />
        <Button title="Adicionar" onPress={handleAdd} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
              key={status}
              status={status}
              isActive={status === filter}
              onPress={() => setFilter(status)}
            />
          ))}

          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onStatus={() => handleToggleItemStatus(item.id)}
              onRemove={() => handleRemove(item.id)}
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
