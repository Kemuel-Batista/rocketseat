export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "reward"
  | "system";

export type ToastRoute = {
  name: string;
  params?: Record<string, unknown>;
};

export type ToastOptions = {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  icon?: string;
  duration?: number;
  route?: ToastRoute;
  actionLabel?: string;
  onPress?: () => void;
  haptic?: boolean;
  dismissible?: boolean;
  progressBar?: boolean;
};

/** Internal: toast item in the stack (id and onClose added by provider). */
export type ToastItem = ToastOptions & {
  id: string;
  onClose: () => void;
};
