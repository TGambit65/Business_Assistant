import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Card container component for displaying content in a card-like UI element
 */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    /> // Restore self-closing div for Card
  );
}

/**
 * Card header component for consistent header styling within cards
 */
export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

/**
 * Card title component for consistent title styling within cards
 */
export function CardTitle({ className, children, ...props }) { // Explicitly accept children
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children} {/* Render children inside the heading */}
    </h3>
  );
}

/**
 * Card description component for consistent description styling
 */
export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Card content component for consistent content padding
 */
export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}

/**
 * Card footer component for consistent footer styling
 */
export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
} 