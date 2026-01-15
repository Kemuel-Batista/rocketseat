import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { type AxiosInstance } from 'axios'
import { Platform } from 'react-native'

function getBaseURL() {
  return Platform.select({
    ios: 'https://b2081f920d68.ngrok-free.app',
    android: 'http://10.0.2.2:3001',
  })
}

export const baseURL = getBaseURL()
console.log({ baseURL })

export class MarketPlaceAPIClient {
  private instance: AxiosInstance
  private isRefreshing = false

  constructor() {
    this.instance = axios.create({
      baseURL,
    })

    this.setupInterceptors()
  }

  getInstance(): AxiosInstance {
    return this.instance
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const userData = await AsyncStorage.getItem('marketplace-auth')
        console.log({ userData })

        if (userData) {
          const {
            state: { token },
          } = JSON.parse(userData)

          console.log({ token })

          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }
}

export const marketPlaceAPIClient = new MarketPlaceAPIClient().getInstance()
