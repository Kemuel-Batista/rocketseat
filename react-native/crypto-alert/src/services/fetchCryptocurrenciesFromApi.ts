import api from "./api";

export async function fetchCryptocurrenciesFromApi() {
  const response = await api.get("/coins/markets", {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 50,
      page: 1,
    },
  });
  return response.data;
}
