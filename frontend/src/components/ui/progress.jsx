import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Progress component for displaying progress bars
 * Can be customized with different sizes and colors
 */
export function Progress({
  className,
  value,
  max = 100,
  ...props
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-2 w-full flex-1 bg-primary transition-all", className)}
        style={{ width: `${value || 0}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      />
    </div>
  );
} 