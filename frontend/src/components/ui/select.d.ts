import * as React from "react";

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps>;

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  open?: boolean;
  value?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps>;

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const SelectContent: React.FC<SelectContentProps>;

export interface SelectItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value: string;
  onSelect?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps>;

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SelectValue: React.FC<SelectValueProps>;