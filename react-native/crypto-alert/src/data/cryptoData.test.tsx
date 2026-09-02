import {
    cryptocurrenciesMockResponse,
    fetchCryptocurrenciesFromApi,
} from "./cryptoData";

describe("API: Crypto Data", () => {
  it("should fetch cryptocurrencies from the API", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => cryptocurrenciesMockResponse,
    } as Response);

    const data = await fetchCryptocurrenciesFromApi();

    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(cryptocurrenciesMockResponse.length);

    data.forEach((coin) => {
      expect(coin).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        symbol: expect.any(String),
        price: expect.any(Number),
        change24h: expect.any(Number),
        image: expect.any(String),
      });
    });
  });
});
