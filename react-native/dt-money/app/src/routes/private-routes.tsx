import { createStackNavigator } from '@react-navigation/stack'

import { Home } from '@/screens/home'

export type PrivateStackParamsList = {
  Home: undefined
}

export function PrivateRoutes() {
  const PrivateStack = createStackNavigator<PrivateStackParamsList>()

  return (
    <PrivateStack.Navigator>
      <PrivateStack.Screen name="Home" component={Home} />
    </PrivateStack.Navigator>
  )
}
