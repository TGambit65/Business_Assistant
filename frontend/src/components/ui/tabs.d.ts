import React from 'react';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
}

export declare function Tabs(props: TabsProps): JSX.Element;
export declare function TabsList(props: TabsListProps): JSX.Element;
export declare function TabsTrigger(props: TabsTriggerProps): JSX.Element;
export declare function TabsContent(props: TabsContentProps): JSX.Element;