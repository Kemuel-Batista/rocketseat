import type { ReactNode } from "react";
import { AlertContext, useAlertProviderState } from "./useAlertProvider";

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const value = useAlertProviderState();
  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
}
