import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground dark:bg-gray-800 dark:border-gray-700",
        success: "success group border-green-200 bg-green-50 text-green-900 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400",
        error: "error group border-red-200 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400",
        warning: "warning group border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400",
        info: "info group border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = forwardRef(({ className, variant, title, description, onClose, ...props }, ref) => {
  const Icon = variant === 'success' ? CheckCircle2 : 
              variant === 'error' ? AlertCircle :
              variant === 'warning' ? AlertTriangle : Info;
  
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {variant !== 'default' && (
          <Icon className="h-5 w-5" />
        )}
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      {onClose && (
        <button
          className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none group-hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Toast.displayName = "Toast";

export { Toast, toastVariants }; 