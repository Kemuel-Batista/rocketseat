import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useAlerts } from "@context/AlertProvider/useAlertProvider";
import { cryptocurrencies } from "@data/cryptoData";

export function useCreateAlertScreen() {
  const { addAlert } = useAlerts();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [errors, setErrors] = useState<{
    crypto?: string;
    price?: string;
  }>({});

  const validate = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!selectedCrypto) {
      newErrors.crypto = "Please select a cryptocurrency";
    }

    if (!targetPrice) {
      newErrors.price = "Please enter a target price";
    } else if (Number.isNaN(Number(targetPrice)) || Number(targetPrice) <= 0) {
      newErrors.price = "Please enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCrypto, targetPrice]);

  const handleSave = useCallback(() => {
    if (!validate()) return;

    const crypto = cryptocurrencies.find((c) => c.id === selectedCrypto);
    if (!crypto) return;

    addAlert({
      cryptocurrency: crypto.name,
      symbol: crypto.symbol,
      targetPrice: Number(targetPrice),
      condition,
    });

    router.replace("/alerts");
  }, [addAlert, condition, selectedCrypto, targetPrice, validate]);

  const goBack = useCallback(() => {
    router.back();
  }, []);

  const isFormValid = Boolean(
    selectedCrypto &&
      targetPrice &&
      !Number.isNaN(Number(targetPrice)) &&
      Number(targetPrice) > 0,
  );

  const cryptoOptions = useMemo(
    () =>
      cryptocurrencies.map((c) => ({
        value: c.id,
        title: c.name,
        subtitle: c.symbol,
      })),
    [],
  );

  return {
    selectedCrypto,
    setSelectedCrypto,
    targetPrice,
    setTargetPrice,
    condition,
    setCondition,
    errors,
    handleSave,
    goBack,
    isFormValid,
    cryptoOptions,
  };
}
