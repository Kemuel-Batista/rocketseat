import { createStackNavigator } from '@react-navigation/stack'

import { Login } from '@/screens/login'
import { Register } from '@/screens/register'

export type PublicStackParamsList = {
  Login: undefined
  Register: undefined
}

export function PublicRoutes() {
  const PublicStack = createStackNavigator<PublicStackParamsList>()

  return (
    <PublicStack.Navigator screenOptions={{ headerShown: false }}>
      <PublicStack.Screen name="Login" component={Login} />
      <PublicStack.Screen name="Register" component={Register} />
    </PublicStack.Navigator>
  )
}
