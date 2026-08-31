import { useAuthStore } from '@/shared/stores/auth.store'
import { Redirect } from 'expo-router'

export default function Index() {
  const { user } = useAuthStore()

  if (user) {
    return <Redirect href="/(private)/home" />
  }

  return <Redirect href="/(public)/login" />
}
