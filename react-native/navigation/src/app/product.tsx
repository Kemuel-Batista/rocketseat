import { useRoute } from '@react-navigation/native'
import { View } from 'react-native'

import { ButtonIcon } from '@/components/button-icon'
import { Header } from '@/components/header'
import { Title } from '@/components/title'
import type { StackRoutesProps } from '@/routes/stack-routes'

type RouteParams = StackRoutesProps<'product'>

export function Product({ navigation, route }: StackRoutesProps<'product'>) {
  // const navigation = useNavigation()
  const { params } = useRoute<RouteParams['route']>()

  return (
    <View
      style={{ flex: 1, padding: 32, paddingTop: 54, backgroundColor: '#FFF' }}
    >
      <Header>
        <ButtonIcon
          name="arrow-circle-left"
          onPress={() => navigation.goBack()}
        />
        {/* <Title>Product {route.params?.id}</Title> */}
        <Title>Product {params?.id}</Title>
      </Header>
    </View>
  )
}
