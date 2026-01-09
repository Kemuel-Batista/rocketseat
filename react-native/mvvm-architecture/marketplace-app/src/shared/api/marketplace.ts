import axios, { type AxiosInstance } from 'axios'

export class MarketPlaceAPIClient {
  private instance: AxiosInstance
  private isRefreshing = false

  constructor() {
    this.instance = axios.create({
      baseURL: '',
    })
  }

  getInstance(): AxiosInstance {
    return this.instance
  }
}

export const marketPlaceAPIClient = new MarketPlaceAPIClient().getInstance()
