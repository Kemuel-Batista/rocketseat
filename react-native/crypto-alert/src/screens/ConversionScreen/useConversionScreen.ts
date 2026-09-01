import { useEffect, useMemo, useState } from "react";
import {
  cryptocurrencies as fallbackCryptos,
  fiatCurrencies,
  fetchCryptocurrenciesFromApi,
  type Cryptocurrency,
} from "@data/cryptoData";
import { formatPrice } from "@utils/index";

export function useConversionScreen() {
  const [amount, setAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [selectedFiat, setSelectedFiat] = useState("USD");
  const [result, setResult] = useState<number | null>(null);
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>(fallbackCryptos);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCryptocurrenciesFromApi();
        if (data.length) {
          setCryptos(data);
        }
      } catch {
        setCryptos(fallbackCryptos);
      }
    })();
  }, []);

  useEffect(() => {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setResult(null);
      return;
    }

    const crypto = cryptos.find((c) => c.id === selectedCrypto);
    const fiat = fiatCurrencies.find((f) => f.code === selectedFiat);

    if (crypto && fiat) {
      const converted = Number(amount) * crypto.price * fiat.rate;
      setResult(converted);
    }
  }, [amount, selectedCrypto, selectedFiat]);

  const isValid = Boolean(
    amount && !Number.isNaN(Number(amount)) && Number(amount) > 0,
  );

  const fiat = fiatCurrencies.find((f) => f.code === selectedFiat);

  const cryptoOptions = useMemo(
    () =>
      cryptos.map((c) => ({
        value: c.id,
        title: c.name,
        subtitle: c.symbol,
      })),
    [cryptos],
  );

  const fiatOptions = useMemo(
    () =>
      fiatCurrencies.map((f) => ({
        value: f.code,
        title: f.code,
        subtitle: f.symbol,
      })),
    [],
  );

  const formattedResult =
    isValid && result !== null && fiat
      ? `${fiat.symbol}${formatPrice(result)}`
      : null;

  return {
    amount,
    setAmount,
    selectedCrypto,
    setSelectedCrypto,
    selectedFiat,
    setSelectedFiat,
    cryptoOptions,
    fiatOptions,
    formattedResult,
    showPlaceholder: !amount,
    showInvalid: Boolean(amount) && !isValid,
  };
}
