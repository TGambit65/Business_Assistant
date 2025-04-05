import React, { useState, useEffect, Suspense } from 'react';

/**
 * LazyLoadWrapper - A component to lazy load children when they come into view
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to lazy load
 * @param {string} props.className - Additional classes for the wrapper
 * @param {string} props.placeholder - Optional placeholder component to show while loading
 * @param {string} props.rootMargin - IntersectionObserver rootMargin (default: "200px")
 * @param {boolean} props.once - Only load once when scrolled into view (default: true)
 * @param {Function} props.onVisible - Optional callback when component becomes visible
 * @param {boolean} props.disabled - Disable lazy loading and render children immediately
 */
const LazyLoadWrapper = ({ 
  children, 
  className = '',
  placeholder = null,
  rootMargin = '200px',
  once = true,
  onVisible = () => {},
  disabled = false,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(disabled);
  const [wasTriggered, setWasTriggered] = useState(disabled);
  
  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      setWasTriggered(true);
      return;
    }
    
    const wrapperRef = document.getElementById('lazyload-' + Math.random().toString(36).substring(2, 9));
    
    if (!wrapperRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible();
          
          if (once) {
            setWasTriggered(true);
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(wrapperRef);
    
    return () => {
      if (wrapperRef) {
        observer.unobserve(wrapperRef);
      }
    };
  }, [disabled, once, onVisible, rootMargin]);
  
  // Generate a unique ID for this wrapper
  const uniqueId = 'lazyload-' + Math.random().toString(36).substring(2, 9);
  
  return (
    <div id={uniqueId} className={className} {...props}>
      <Suspense fallback={placeholder || <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-full w-full min-h-[100px] rounded-md"></div>}>
        {(isVisible || wasTriggered) ? children : placeholder}
      </Suspense>
    </div>
  );
};

export default LazyLoadWrapper; 