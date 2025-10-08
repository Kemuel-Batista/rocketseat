import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { Login } from '@/screens/login'
import { Register } from '@/screens/register'

export type PublicStackParamsList = {
  login: undefined
  register: undefined
}

const PublicStack = createStackNavigator<PublicStackParamsList>()

export function NavigationRoutes() {
  return (
    <NavigationContainer>
      <PublicStack.Navigator
        id={undefined}
        screenOptions={{ headerShown: false }}
      >
        <PublicStack.Screen name="login" component={Login} />
        <PublicStack.Screen name="register" component={Register} />
      </PublicStack.Navigator>
    </NavigationContainer>
  )
}
