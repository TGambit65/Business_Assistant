import React, { useEffect } from 'react';
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

const Dialog = React.forwardRef(({ className, children, open, onOpenChange, ...props }, ref) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  // Don't render if not open
  if (!open) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4",
        className
      )}
      onClick={handleBackdropClick}
      {...props}
    >
      {children}
    </div>
  );
});

Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative bg-background dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto p-6",
      className
    )}
    // Stop propagation to prevent closing when clicking inside content
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
));

DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 flex flex-col space-y-1.5", className)}
    {...props}
  >
    {children}
  </div>
));

DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  >
    {children}
  </h3>
));

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  >
    {children}
  </p>
));

DialogDescription.displayName = "DialogDescription";

const DialogClose = React.forwardRef(({ className, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
});

DialogClose.displayName = "DialogClose";

const DialogFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 pt-4 border-t",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
};