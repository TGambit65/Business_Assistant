import React from 'react';

const FileSummary = ({ size = 24, className = '', ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"  
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`lucide lucide-file-summary ${className}`}
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="8" cy="16" r="1" />
      <line x1="10" y1="12" x2="16" y2="12" />
      <line x1="10" y1="16" x2="16" y2="16" />
    </svg>
  );
};

export default FileSummary; 