import { createContext, useContext, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  dismissing?: boolean;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
});

export function useToast() {
  const { addToast } = useContext(ToastContext);
  return {
    success: useCallback((msg: string) => addToast("success", msg), [addToast]),
    error: useCallback((msg: string) => addToast("error", msg), [addToast]),
    warning: useCallback((msg: string) => addToast("warning", msg), [addToast]),
    info: useCallback((msg: string) => addToast("info", msg), [addToast]),
  };
}
