import { useCallback, useEffect, useState } from "react";
import {
  cryptocurrencies as fallbackCryptos,
  fetchCryptocurrenciesFromApi,
  type Cryptocurrency,
} from "@data/cryptoData";

export type ListLoadingState = "idle" | "loading" | "error" | "empty";

export function useCryptoListScreen() {
  const [loadingState, setLoadingState] =
    useState<ListLoadingState>("loading");
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>(fallbackCryptos);

  const load = useCallback(async () => {
    try {
      setLoadingState("loading");
      const data = await fetchCryptocurrenciesFromApi();
      if (!data.length || data.length === 0) {
        setLoadingState("empty");
        setCryptos([]);
        return;
      }
      setCryptos(data);
      setLoadingState("idle");
    } catch {
      // Mantém os dados estáticos como fallback.
      setCryptos(fallbackCryptos);
      setLoadingState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRetry = useCallback(() => {
    load();
  }, [load]);

  return {
    loadingState,
    cryptocurrencies: cryptos,
    handleRetry,
  };
}
