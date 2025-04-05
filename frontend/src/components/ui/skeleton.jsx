import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Skeleton component for loading states
 * Displays a placeholder that simulates the appearance of content
 * while actual data is being loaded
 */
export function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      {...props}
    />
  );
} 