import { Redirect } from 'expo-router'

export default function App() {
  const userData = {
    token: 'hdashjdqaeq123',
    name: 'User test',
  }

  if (userData) {
    return <Redirect href="/(private)/home" />
  }

  return <Redirect href="/login" />
}
