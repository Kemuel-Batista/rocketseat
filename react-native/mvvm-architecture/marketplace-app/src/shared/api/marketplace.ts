import axios, { type AxiosInstance } from 'axios'
import { Platform } from 'react-native'

function getBaseURL() {
  return Platform.select({
    ios: 'http://192.168.1.8:3001',
    android: 'http://10.0.2.2:3001',
  })
}

const baseURL = getBaseURL()

export class MarketPlaceAPIClient {
  private instance: AxiosInstance
  private isRefreshing = false

  constructor() {
    this.instance = axios.create({
      baseURL,
    })
  }

  getInstance(): AxiosInstance {
    return this.instance
  }
}

export const marketPlaceAPIClient = new MarketPlaceAPIClient().getInstance()
