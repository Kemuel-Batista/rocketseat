import { createStackNavigator } from '@react-navigation/stack'

import { Home } from '@/screens/home'

export type PrivateStackParamsList = {
  home: undefined
}

export function PrivateRoutes() {
  const PrivateStack = createStackNavigator<PrivateStackParamsList>()

  return (
    <PrivateStack.Navigator>
      <PrivateStack.Screen name="home" component={Home} />
    </PrivateStack.Navigator>
  )
}
