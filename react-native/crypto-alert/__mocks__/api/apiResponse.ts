export interface CryptocurrencyMockResponse {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  change24h: number;
  image?: string;
}

export const cryptocurrenciesMockResponse: CryptocurrencyMockResponse[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    current_price: 67999.5,
    change24h: 2.45,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1747033579",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    current_price: 3850.25,
    change24h: -1.23,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1747033538",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    current_price: 0.58,
    change24h: 5.67,
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png?1747033579",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    current_price: 145.32,
    change24h: 3.89,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1747033571",
  },
  {
    id: "ripple",
    name: "Ripple",
    symbol: "XRP",
    current_price: 0.52,
    change24h: -0.45,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1747033571",
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    current_price: 7.23,
    change24h: 1.98,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1747033571",
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    current_price: 0.15,
    change24h: -2.11,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1747033571",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    current_price: 38.45,
    change24h: 4.56,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1747033571",
  },
];
