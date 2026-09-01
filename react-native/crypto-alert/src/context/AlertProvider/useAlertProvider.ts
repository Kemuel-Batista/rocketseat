import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "cryptoAlerts";

export interface PriceAlert {
  id: string;
  cryptocurrency: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  createdAt: string;
}

interface AlertContextValue {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  deleteAlert: (id: string) => void;
}

export const AlertContext = createContext<AlertContextValue | undefined>(
  undefined,
);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useAlertProviderState() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && stored) {
          setAlerts(JSON.parse(stored) as PriceAlert[]);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alerts)).catch(() => {});
  }, [alerts, hydrated]);

  const addAlert = useCallback((alert: Omit<PriceAlert, "id" | "createdAt">) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return useMemo(
    () => ({ alerts, addAlert, deleteAlert }),
    [alerts, addAlert, deleteAlert],
  );
}

export function useAlerts(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlerts must be used within AlertProvider");
  }
  return ctx;
}
