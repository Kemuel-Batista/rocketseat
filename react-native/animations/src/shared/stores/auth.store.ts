import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthStore {
  user: {
    id: string
    name: string
    createdAt: Date
  } | null
  setAuthenticated: (name: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      logout: () => {},
      setAuthenticated: (name: string) => {
        set({
          user: {
            name,
            id: `user-${Date.now()}`,
            createdAt: new Date(),
          },
        })
      },
    }),
    {
      name: '@memory-game:auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
