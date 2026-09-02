import { cryptocurrencies } from "@/data/cryptoData";
import { AxiosResponse } from "axios";
import api from "./api";
import { fetchCryptocurrenciesFromApi } from "./fetchCryptocurrenciesFromApi";

jest.mock("./api", () => ({
  get: jest.fn()
}))

describe("API: CryptoData", () => {
  it("should fetch cryptocurrencies from the API", async () => {
    jest.spyOn(api, "get").mockResolvedValue({
      data: cryptocurrencies
    } as AxiosResponse)

    const data = await fetchCryptocurrenciesFromApi()
    expect(data).toEqual(cryptocurrencies)
  })
})
