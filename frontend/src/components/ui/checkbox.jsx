import * as React from "react"
// Removed unused import

// Import cn utility if available, otherwise create a simple version
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

const Checkbox = React.forwardRef(({ 
  className, 
  checked, 
  defaultChecked,
  onChange,
  disabled,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked || false);
  
  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);
  
  const handleChange = (e) => {
    if (checked === undefined) {
      setIsChecked(e.target.checked);
    }
    onChange?.(e);
  };
  
  return (
    <div className={cn("inline-flex items-center", className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="h-5 w-5 rounded-sm border-2 border-primary bg-background text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox }