import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}

export declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;

export interface ButtonPropsWithIcon extends ButtonProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export declare const ButtonWithIcon: React.FC<ButtonPropsWithIcon>;

export declare const buttonVariants: (props?: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}) => string; 