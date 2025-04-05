import React from 'react';
import GithubIcon from '../icons/GithubIcon';

/**
 * A button component that displays a GitHub icon alongside text
 * 
 * This component demonstrates what could be generated using the 21st.dev Magic MCP
 * server's component generation capabilities
 */
const GithubButton = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  onClick,
  className,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  const variants = {
    default: "bg-[#24292f] text-white hover:bg-[#1b1f24] focus-visible:ring-[#24292f]",
    outline: "border border-[#24292f] text-[#24292f] hover:bg-[#24292f]/10 focus-visible:ring-[#24292f]",
    ghost: "text-[#24292f] hover:bg-[#24292f]/10 focus-visible:ring-[#24292f]",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      <span className={iconSizes[size]}>
        <GithubIcon />
      </span>
      {children}
    </button>
  );
};

export default GithubButton;
