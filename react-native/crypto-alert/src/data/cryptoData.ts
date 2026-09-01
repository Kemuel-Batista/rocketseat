export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image?: string;
}

export const cryptocurrencies: Cryptocurrency[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 67999.5,
    change24h: 2.45,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501628",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 3850.25,
    change24h: -1.23,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.58,
    change24h: 5.67,
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png?1696501628",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 145.32,
    change24h: 3.89,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501628",
  },
  {
    id: "ripple",
    name: "Ripple",
    symbol: "XRP",
    price: 0.52,
    change24h: -0.45,
    image: "https://assets.coingecko.com/coins/images/44/large/ripple.png?1696501628",
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    price: 7.23,
    change24h: 1.98,
    image: "https://assets.coingecko.com/coins/images/6312/large/polkadot.png?1696501628",
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.15,
    change24h: -2.11,
    image: "https://assets.coingecko.com/coins/images/7129/large/dogecoin.png?1696501628",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    price: 38.45,
    change24h: 4.56,
    image: "https://assets.coingecko.com/coins/images/4257/large/avalanche-2.png?1696501628",
  },
];

export const fiatCurrencies = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "BRL", symbol: "R$", rate: 5.12 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "JPY", symbol: "¥", rate: 149.5 },
];

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

function getCoinGeckoHeaders() {
  const apiKey = process.env.EXPO_PUBLIC_COINGECKO_API_KEY;

  // A chave é opcional no Demo, mas recomendada.
  if (!apiKey) {
    return {} as Record<string, string>;
  }

  return {
    "x-cg-demo-api-key": apiKey,
  } as Record<string, string>;
}

export async function fetchCryptocurrenciesFromApi(): Promise<Cryptocurrency[]> {
  const searchParams = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "50",
    page: "1",
    price_change_percentage: "24h",
  });

  const headers: HeadersInit = {
    Accept: "application/json",
    ...getCoinGeckoHeaders(),
  };

  const response = await fetch(
    `${COINGECKO_BASE_URL}/coins/markets?${searchParams.toString()}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cryptocurrencies: ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h?: number | null;  
    image: string;
  }>;

  return data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h ?? 0,
    image: coin.image,
  }));
}
