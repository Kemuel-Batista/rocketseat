import { NavigationContainer } from '@react-navigation/native'

import { BottomRoutes } from './bottom-routes'

export function Routes() {
  return (
    <NavigationContainer>
      {/* <StackRoutes /> */}
      <BottomRoutes />
    </NavigationContainer>
  )
}
