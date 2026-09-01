import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

import { Toast } from "./Toast";
import type { ToastItem, ToastOptions } from "./types";

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  showSuccess: (message: string, options?: Partial<ToastOptions>) => string;
  showError: (message: string, options?: Partial<ToastOptions>) => string;
  showWarning: (message: string, options?: Partial<ToastOptions>) => string;
  showInfo: (message: string, options?: Partial<ToastOptions>) => string;
  showReward: (message: string, options?: Partial<ToastOptions>) => string;
  showSystem: (message: string, options?: Partial<ToastOptions>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id ?? generateId();
      const item: ToastItem = {
        ...options,
        id,
        onClose: () => removeToast(id),
      };
      setToasts((prev) => [...prev, item]);
      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "success", message }),
    [showToast]
  );
  const showError = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "error", message }),
    [showToast]
  );
  const showWarning = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "warning", message }),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "info", message }),
    [showToast]
  );
  const showReward = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "reward", message }),
    [showToast]
  );
  const showSystem = useCallback(
    (message: string, options?: Partial<ToastOptions>) => showToast({ ...options, type: "system", message }),
    [showToast]
  );

  const value: ToastContextValue = useMemo(
    () => ({
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showReward,
      showSystem,
      dismiss: removeToast,
    }),
    [removeToast, showError, showInfo, showReward, showSuccess, showSystem, showToast, showWarning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            layout={Layout.springify()}
            style={styles.toastWrap}
          >
            <Toast {...toast} />
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 9999,
    alignItems: "center",
  },
  toastWrap: {
    width: "100%",
    maxWidth: 400,
  },
});
