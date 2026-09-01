import { router } from "expo-router";
import { useCallback } from "react";
import { useAlerts } from "@context/AlertProvider/useAlertProvider";

export function usePriceAlertsScreen() {
  const { alerts, deleteAlert } = useAlerts();

  const goToCreate = useCallback(() => {
    router.push("/alerts/create");
  }, []);

  return { alerts, deleteAlert, goToCreate };
}
