import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Tabs container component
 */
export function Tabs({ className, ...props }) {
  return (
    <div className={cn("data-[orientation=vertical]:flex-col", className)} {...props} />
  );
}

/**
 * Tabs list component that contains the tab triggers
 */
export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

/**
 * Tab trigger component that activates a tab when clicked
 */
export function TabsTrigger({ className, ...props }) {
  return (
    <button
      role="tab"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Tab content component that displays content when its trigger is active
 */
export function TabsContent({ className, ...props }) {
  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

/**
 * Tab component for backward compatibility with existing code
 */
export const Tab = React.forwardRef(({ className, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
      className
    )}
    {...props}
  />
));
Tab.displayName = "Tab";

/**
 * TabPanel component for backward compatibility with existing code
 */
export const TabPanel = React.forwardRef(({ className, ...props }, ref) => (
  <TabsContent
    ref={ref}
    className={cn(
      "py-4",
      className
    )}
    {...props}
  />
));
TabPanel.displayName = "TabPanel"; 