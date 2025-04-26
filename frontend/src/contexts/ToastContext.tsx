import React, { createContext, useCallback, useContext, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { X } from 'lucide-react';

// Define the type for the toast context
interface ToastContextType {
  showToast: (title: string, message: string, type?: string, duration?: number) => string;
  success: (message: string, options?: { title?: string; duration?: number }) => string;
  error: (message: string, options?: { title?: string; duration?: number }) => string;
  warning: (message: string, options?: { title?: string; duration?: number }) => string;
  info: (message: string, options?: { title?: string; duration?: number }) => string;
  clearAll: () => void;
  remove: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType>({} as ToastContextType);

interface Toast {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: string = 'default', duration: number = 5000): string => {
    const id = Math.random().toString(36).substring(2, 11);

    setToasts((currentToasts) => [...currentToasts, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message: string, options: { title?: string; duration?: number } = {}) => {
    return showToast(options.title || 'Success', message, 'success', options.duration || 5000);
  }, [showToast]);

  const error = useCallback((message: string, options: { title?: string; duration?: number } = {}) => {
    return showToast(options.title || 'Error', message, 'destructive', options.duration || 5000);
  }, [showToast]);

  const warning = useCallback((message: string, options: { title?: string; duration?: number } = {}) => {
    return showToast(options.title || 'Warning', message, 'warning', options.duration || 5000);
  }, [showToast]);

  const info = useCallback((message: string, options: { title?: string; duration?: number } = {}) => {
    return showToast(options.title || 'Info', message, 'default', options.duration || 5000);
  }, [showToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showToast,
    success,
    error,
    warning,
    info,
    clearAll,
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            variant={toast.type}
            className="relative animate-slide-in-right"
          >
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            <AlertTitle className="text-sm font-medium">{toast.title}</AlertTitle>
            <AlertDescription className="text-sm">{toast.message}</AlertDescription>
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};