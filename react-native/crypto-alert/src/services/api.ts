import axios from "axios";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export const api = axios.create({
  baseURL: COINGECKO_BASE_URL,
})

export default api;
