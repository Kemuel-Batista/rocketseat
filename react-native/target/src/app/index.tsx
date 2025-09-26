import { router } from 'expo-router'
import { Button, Text, View } from 'react-native'

import { fontFamily } from '@/theme/font-family'

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontFamily: fontFamily.bold }}>Olá, expo router</Text>

      <Button title="Nova meta" onPress={() => router.navigate('/target')} />
      <Button
        title="Transação"
        onPress={() => router.navigate('/transaction/132')}
      />

      <Button
        title="Progress"
        onPress={() => router.navigate('/in-progress/132')}
      />
    </View>
  )
}
