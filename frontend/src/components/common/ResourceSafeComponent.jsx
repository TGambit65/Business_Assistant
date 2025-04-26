import React, { useEffect, useState, useRef } from 'react';
import { useRenderGuard } from '../../utils/renderGuard'; // Removed unused withRenderGuard

/**
 * Wraps a component with protection against common resource issues:
 * - Render loop detection
 * - Memory leak prevention
 * - Cleanup on unmount
 * 
 * @param {Object} props
 * @param {React.Component} props.component - The component to wrap
 * @param {Object} props.componentProps - Props to pass to the wrapped component
 * @param {string} props.name - Name to use for tracking (defaults to component name)
 * @param {React.Component} props.fallback - What to render if protection is triggered
 * @param {boolean} props.disableRenderGuard - Whether to disable render loop protection
 */
const ResourceSafeComponent = ({
  component: Component,
  componentProps = {},
  name,
  fallback,
  disableRenderGuard = false
}) => {
  const componentName = name || Component.displayName || Component.name || 'UnknownComponent';
  const mountTime = useRef(Date.now());
  const [errorState, setErrorState] = useState(null);
  
  // Always call hooks unconditionally, but use the result based on props.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // The hook is called unconditionally; ESLint might be misinterpreting.
  const shouldRender = useRenderGuard(componentName);
  const renderingAllowed = disableRenderGuard || shouldRender;
  
  // Memory leak detection
  useEffect(() => {
    const memoryCheckInterval = setInterval(() => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const usedHeapSize = memory.usedJSHeapSize;
        const totalHeapSize = memory.jsHeapSizeLimit;
        const memoryUsage = (usedHeapSize / totalHeapSize) * 100;
        
        // If this component has been mounted for over 30 seconds and
        // memory usage is high, we might have a memory leak
        const componentAge = Date.now() - mountTime.current;
        if (componentAge > 30000 && memoryUsage > 80) {
          console.warn(`Possible memory leak in ${componentName}. High memory usage after extended mount time.`);
          document.body.classList.add('resource-constrained');
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, [componentName]);
  
  // Error boundary functionality
  useEffect(() => {
    const originalErrorHandler = window.onerror;
    
    // Set up global error handler to catch errors from this component
    window.onerror = (message, source, line, column, error) => {
      // Only catch errors if they're from this component
      // This is a simplistic check and would need to be improved
      // in a real implementation
      if (source && source.includes(componentName)) {
        console.error(`Error in ${componentName}:`, error);
        setErrorState({
          message,
          error
        });
        
        // Mark as resource constrained to reduce load
        document.body.classList.add('resource-constrained');
        
        // Prevent default handling
        return true;
      }
      
      // Call original handler for other errors
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, line, column, error);
      }
      
      // Don't prevent default handling
      return false;
    };
    
    // Cleanup
    return () => {
      window.onerror = originalErrorHandler;
    };
  }, [componentName]);
  
  // Handle errors or render guard intervention
  if (errorState) {
    return fallback || (
      <div className="resource-safe-fallback error">
        <h3>Component Error</h3>
        <p>An error occurred in {componentName}</p>
        <button onClick={() => setErrorState(null)}>Retry</button>
      </div>
    );
  }
  
  if (!renderingAllowed) {
    return fallback || (
      <div className="resource-safe-fallback loop">
        <h3>Rendering Limited</h3>
        <p>Excessive renders detected in {componentName}</p>
      </div>
    );
  }
  
  // Normal rendering
  return <Component {...componentProps} />;
};

/**
 * HOC version for easier wrapping of existing components
 * @param {Object} options - Configuration options
 * @returns {Function} A function that takes a component and returns a wrapped version
 */
export const withResourceSafety = (options = {}) => (Component) => {
  const WrappedComponent = (props) => (
    <ResourceSafeComponent
      component={Component}
      componentProps={props}
      {...options}
    />
  );
  
  WrappedComponent.displayName = `ResourceSafe(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

export default ResourceSafeComponent; 