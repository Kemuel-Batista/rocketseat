import { View } from 'react-native'

import { ButtonIcon } from '@/components/button-icon'
import { Header } from '@/components/header'
import { Title } from '@/components/title'
import type { StackRoutesProps } from '@/routes/stack-routes'

// type Props = NativeStackScreenProps<StackRoutesList, 'home'>

export function Home({ navigation }: StackRoutesProps<'home'>) {
  return (
    <View
      style={{ flex: 1, padding: 32, paddingTop: 54, backgroundColor: '#FFF' }}
    >
      <Header>
        <Title>Home</Title>
        <ButtonIcon
          name="add-circle"
          onPress={() => navigation.navigate('product', { id: '7' })}
        />
      </Header>
    </View>
  )
}
