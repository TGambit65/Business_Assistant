import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const touchFriendlyButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/70",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/70",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 min-w-[44px] min-h-[44px]", // Minimum 44x44px for touch targets
        sm: "h-10 rounded-md px-4 py-2 min-w-[44px] min-h-[44px]",
        lg: "h-14 rounded-md px-8 py-4 min-w-[44px] min-h-[44px]",
        icon: "h-12 w-12 min-w-[44px] min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const TouchFriendlyButton = React.forwardRef(
  ({ className, variant, size, onPress, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    
    // Handle touch events
    const handleTouchStart = (e) => {
      // Prevent double-tap zoom on touch devices
      e.preventDefault();
      props.onTouchStart?.(e);
    };
    
    const handlePress = (e) => {
      if (onPress) {
        e.preventDefault();
        onPress(e);
      }
      props.onClick?.(e);
    };
    
    return (
      <Comp
        className={cn(touchFriendlyButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handlePress}
        onTouchStart={handleTouchStart}
        style={{ touchAction: "manipulation" }}
        {...props}
      />
    );
  }
);

TouchFriendlyButton.displayName = "TouchFriendlyButton";

export { TouchFriendlyButton, touchFriendlyButtonVariants }; 