import { useCallback, useMemo, useState } from "react";
import type { Cryptocurrency } from "@data/cryptoData";
import { useAlerts, type PriceAlert } from "@context/AlertProvider/useAlertProvider";

export function useCryptoCard(crypto: Cryptocurrency) {
  const { alerts } = useAlerts();

  const alertsForCrypto: PriceAlert[] = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.symbol.toUpperCase() === crypto.symbol.toUpperCase() ||
          alert.cryptocurrency.toLowerCase() === crypto.name.toLowerCase(),
      ),
    [alerts, crypto.name, crypto.symbol],
  );

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    if (!alertsForCrypto.length) return;
    setExpanded((prev) => !prev);
  }, [alertsForCrypto.length]);

  const isPositive = crypto.change24h >= 0;
  const hasAlert = alertsForCrypto.length > 0;

  return { isPositive, hasAlert, alertsForCrypto, expanded, toggleExpanded };
}
