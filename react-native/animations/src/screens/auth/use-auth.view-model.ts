import { router } from 'expo-router'
import { useState } from 'react'

import { useAuthStore } from '@/shared/stores/auth.store'

export const useAuthViewModel = () => {
  const [username, setUsername] = useState('')

  const { setAuthenticated } = useAuthStore()

  const handleSubmit = () => {
    if (!username.length) return
    setAuthenticated(username)
    router.replace('/(private)/home')
  }

  return {
    username,
    setUsername,
    handleSubmit,
  }
}
