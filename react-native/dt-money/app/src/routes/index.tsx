import { NavigationContainer } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { SystemBars } from 'react-native-edge-to-edge'

import { PrivateRoutes } from './private-routes'
import { PublicRoutes } from './public-routes'

export function NavigationRoutes() {
  const [user, setUser] = useState({
    name: '',
  })

  const Routes = useCallback(() => {
    if (!user) {
      return <PublicRoutes />
    } else {
      return <PrivateRoutes />
    }
  }, [user])

  return (
    <NavigationContainer>
      <SystemBars style="light" />
      <Routes />
    </NavigationContainer>
  )
}
