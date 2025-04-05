import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Select container component
 */
export function Select({ children, value, onValueChange, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');
  
  React.useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);
  
  const handleSelect = (val) => {
    setSelectedValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };
  
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open), 
            open,
            value: selectedValue
          });
        }
        if (child.type === SelectContent) {
          return open ? React.cloneElement(child, {
            onSelect: handleSelect
          }) : null;
        }
        return child;
      })}
    </div>
  );
}

/**
 * Select trigger component that shows the current value and opens the select dropdown
 */
export function SelectTrigger({ className, children, onClick, open, value, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
      aria-expanded={open}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/**
 * Select value component that displays the current selected value
 */
export function SelectValue({ placeholder }) {
  const context = React.useContext(React.createContext({ value: '' }));
  return <span>{context.value || placeholder}</span>;
}

/**
 * Select content component that contains the select items
 */
export function SelectContent({ className, children, onSelect, ...props }) {
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="w-full p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

/**
 * Select item component that represents a selectable option
 */
export function SelectItem({ className, children, value, onSelect, ...props }) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onSelect && onSelect(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* Checkmark icon for selected item */}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
} 