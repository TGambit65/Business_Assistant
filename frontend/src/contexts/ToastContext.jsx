import React, { createContext, useCallback, useContext, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { X } from 'lucide-react';

export const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((title, message, type = 'default', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setToasts((currentToasts) => [...currentToasts, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, options = {}) => {
    return showToast(options.title || 'Success', message, 'success', options.duration || 5000);
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(options.title || 'Error', message, 'destructive', options.duration || 5000);
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(options.title || 'Warning', message, 'warning', options.duration || 5000);
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
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
            <AlertTitle>{toast.title}</AlertTitle>
            <AlertDescription>{toast.message}</AlertDescription>
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