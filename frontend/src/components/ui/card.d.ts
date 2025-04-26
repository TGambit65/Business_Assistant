import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  asChild?: boolean;
}

export declare const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  asChild?: boolean;
}

export declare const CardHeader: React.ForwardRefExoticComponent<
  CardHeaderProps & React.RefAttributes<HTMLDivElement>
>;

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  asChild?: boolean;
}

export declare const CardTitle: React.ForwardRefExoticComponent<
  CardTitleProps & React.RefAttributes<HTMLHeadingElement>
>;

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  asChild?: boolean;
}

export declare const CardDescription: React.ForwardRefExoticComponent<
  CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>
>;

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  asChild?: boolean;
}

export declare const CardContent: React.ForwardRefExoticComponent<
  CardContentProps & React.RefAttributes<HTMLDivElement>
>;

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  asChild?: boolean;
}

export declare const CardFooter: React.ForwardRefExoticComponent<
  CardFooterProps & React.RefAttributes<HTMLDivElement>
>; 