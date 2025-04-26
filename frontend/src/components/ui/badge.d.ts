import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps>;
