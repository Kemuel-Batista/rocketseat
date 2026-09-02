import { PriceAlert } from "@/context/AlertProvider/useAlertProvider";

export const cryptoAlertsMock: PriceAlert[] = [
  {
    id: "1",
    cryptocurrency: "Bitcoin",
    symbol: "BTC",
    targetPrice: 100000,
    condition: "above",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    cryptocurrency: "Ethereum",
    symbol: "ETH",
    targetPrice: 5000,
    condition: "below",
    createdAt: new Date().toISOString(),
  },
]
