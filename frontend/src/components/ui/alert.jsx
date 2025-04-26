import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Alert container component for displaying important messages
 */
export function Alert({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "default" && "bg-background text-foreground",
        variant === "destructive" && "border-destructive/50 text-destructive dark:border-destructive",
        className
      )}
      {...props}
    />
  );
}

/**
 * Alert title component for alert headings
 */
export function AlertTitle({
  className,
  children, // Explicitly accept children
  ...props
}) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children} {/* Render children inside the heading */}
    </h5>
  );
}

/**
 * Alert description component for alert content
 */
export function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      className={cn("text-sm", className)}
      {...props}
    />
  );
} 