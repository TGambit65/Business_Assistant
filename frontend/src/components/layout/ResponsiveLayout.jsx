import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * Responsive layout component that adapts to different screen sizes
 * Provides appropriate layout based on device size
 */
const ResponsiveLayout = ({ 
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout,
  className = "",
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  // Determine which layout to use
  const getLayout = () => {
    if (isMobile && mobileLayout) return mobileLayout;
    if (isTablet && tabletLayout) return tabletLayout;
    if (isDesktop && desktopLayout) return desktopLayout;
    
    // Fallback to children if no specific layout
    return children;
  };

  return (
    <div className={`responsive-layout ${className}`} {...props}>
      {getLayout()}
    </div>
  );
};

export default ResponsiveLayout; 