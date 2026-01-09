import { useState } from 'react'

export function useRegisterViewModel() {
  const [userData, setUserData] = useState()

  return {
    userData,
    setUserData,
  }
}
