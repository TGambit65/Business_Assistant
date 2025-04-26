/**
 * RenderGuard utility for detecting and preventing infinite render loops
 * This helps prevent React components from consuming excessive resources
 */

const renderCounts = new Map();
const renderTimes = new Map();
const MAX_RENDERS_WARNING = 15;  // Lower threshold for warning
const MAX_RENDERS_ERROR = 30;    // Lower threshold for error
const RESET_AFTER = 5000;       // Shorter reset window
let warningShown = false;
let redirectLoopDetected = false;
let renderGuardActive = true;

// Track navigation counts to detect redirect loops
const navigationCounts = {
  '/login': 0,
  '/dashboard': 0,
  timestamps: {}
};

/**
 * Track component renders to detect potential infinite loops
 * @param {string} componentName - The name of the component being rendered
 * @returns {boolean} False if rendering should be interrupted
 */
export function trackRender(componentName) {
  if (!renderGuardActive) return true;
  
  const now = Date.now();
  const currentCount = renderCounts.get(componentName) || 0;
  const lastRenderTime = renderTimes.get(componentName) || 0;
  
  // Reset if it's been a while since the last render
  if (now - lastRenderTime > RESET_AFTER && currentCount > 0) {
    renderCounts.set(componentName, 1);
    renderTimes.set(componentName, now);
    return true;
  }
  
  // Track this render
  renderCounts.set(componentName, currentCount + 1);
  renderTimes.set(componentName, now);
  
  // Log redirection loops to more aggressively detect navigation issues
  if (componentName === 'LoginPage' || componentName === 'DashboardPage') {
    const path = componentName === 'LoginPage' ? '/login' : '/dashboard';
    navigationCounts[path]++;
    navigationCounts.timestamps[path] = now;
    
    // Check for redirection loop between login and dashboard
    const loginCount = navigationCounts['/login'];
    const dashboardCount = navigationCounts['/dashboard'];
    
    if (loginCount > 5 && dashboardCount > 5) {
      const timeDiff = Math.abs(
        (navigationCounts.timestamps['/login'] || 0) - 
        (navigationCounts.timestamps['/dashboard'] || 0)
      );
      
      // If we've seen both pages multiple times within a short timeframe
      if (timeDiff < 5000 && !redirectLoopDetected) {
        redirectLoopDetected = true;
        console.error(
          `🚨 REDIRECT LOOP DETECTED between /login and /dashboard. This is likely caused by` +
          ` conflicting authentication checks or redirects. Try clearing localStorage and sessionStorage.`
        );
        
        // Show a popup to help the user
        showLoopWarningPopup();
        
        // Break the loop
        return false;
      }
    }
  }
  
  // Check for excessive renders
  if (currentCount >= MAX_RENDERS_ERROR) {
    if (!warningShown) {
      console.error(
        `🔥 INFINITE LOOP DETECTED: ${componentName} rendered ${currentCount} times in rapid succession. ` +
        `Further renders will be limited to prevent browser crash. Check for state updates in render or effects.`
      );
      warningShown = true;
      
      // Apply resource-constrained mode 
      document.body.classList.add('resource-constrained');
      
      // Show a visible warning
      showLoopWarningPopup();
      
      // Report to error tracking service if available
      if (window.reportError) {
        window.reportError({
          type: 'INFINITE_LOOP',
          component: componentName,
          renderCount: currentCount,
          timestamp: now
        });
      }
    }
    return false; // Break the render loop
  } else if (currentCount >= MAX_RENDERS_WARNING && currentCount % 5 === 0) {
    console.warn(
      `⚠️ Possible render loop: ${componentName} rendered ${currentCount} times in rapid succession. ` +
      `This may indicate an infinite loop. Check for state updates in render or effects.`
    );
    return true;
  }
  
  return true;
}

/**
 * Display a warning popup that the user can see
 */
function showLoopWarningPopup() {
  // Only show once
  if (document.getElementById('loop-warning-popup')) return;
  
  const popup = document.createElement('div');
  popup.id = 'loop-warning-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f44336;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 9999;
    max-width: 80%;
    text-align: center;
    font-family: sans-serif;
  `;
  
  popup.innerHTML = `
    <h3 style="margin: 0 0 10px 0; font-size: 16px;">⚠️ Infinite Loop Detected</h3>
    <p style="margin: 0 0 10px 0; font-size: 14px;">
      The application detected an infinite loop which could crash your browser.
      Rendering has been paused for protection.
    </p>
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
      <button id="emergency-fix-btn" style="
        background: #2196F3;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
        margin-bottom: 10px;
      ">Emergency Fix</button>
      <button id="rescue-page-btn" style="
        background: #4CAF50;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
        margin-bottom: 10px;
      ">Rescue Page</button>
      <button id="dismiss-warning-btn" style="
        background: #757575;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
      ">Dismiss</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add click handlers
  document.getElementById('emergency-fix-btn').addEventListener('click', () => {
    // Clear storage data that might be causing the loop
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Disable the render guard to allow navigation
    renderGuardActive = false;
    
    // Redirect to login page directly
    window.location.href = '/login';
  });
  
  document.getElementById('rescue-page-btn').addEventListener('click', () => {
    // Navigate to the rescue page
    window.location.href = '/rescue.html';
  });
  
  document.getElementById('dismiss-warning-btn').addEventListener('click', () => {
    popup.remove();
  });
}

/**
 * Reset tracking for a component
 * @param {string} componentName - The component to reset
 */
export function resetTracking(componentName) {
  renderCounts.delete(componentName);
  renderTimes.delete(componentName);
}

/**
 * Higher-order component that wraps a component with render loop protection
 * @param {React.Component} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.Component} The wrapped component
 */
export function withRenderGuard(Component, options = {}) {
  const componentName = options.name || Component.displayName || Component.name || 'UnknownComponent';
  
  // Return wrapped component
  const WrappedComponent = (props) => {
    const shouldRender = trackRender(componentName);
    
    // If we've detected an infinite loop, render a fallback instead
    if (!shouldRender) {
      if (options.fallback) {
        return options.fallback;
      }
      
      // Default fallback
      return (
        <div className="render-guard-fallback" style={{
          padding: '20px',
          margin: '10px',
          border: '1px solid #f44336',
          borderRadius: '4px',
          backgroundColor: '#ffebee'
        }}>
          <p style={{ color: '#d32f2f' }}>Rendering paused to prevent browser crash.</p>
          <button 
            onClick={() => {
              resetTracking(componentName);
              warningShown = false;
              window.location.reload();
            }}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reset & Reload
          </button>
        </div>
      );
    }
    
    // Normal render path
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `RenderGuard(${componentName})`;
  return WrappedComponent;
}

/**
 * Custom React hook to track renders in functional components
 * @param {string} componentName - The name of the component
 * @param {Object} options - Additional options (like threshold overrides)
 * @returns {boolean} Whether rendering should proceed
 */
export function useRenderGuard(componentName, options = {}) {
  return trackRender(componentName);
}

/**
 * Setup periodic cleanup of render tracking data
 */
export function setupRenderGuardCleanup() {
  setInterval(() => {
    const now = Date.now();
    
    // Clean up entries for components that haven't rendered in a while
    renderTimes.forEach((time, component) => {
      if (now - time > RESET_AFTER * 2) {
        renderCounts.delete(component);
        renderTimes.delete(component);
      }
    });
    
    // Reset warning flag if no recent issues
    if (warningShown && renderCounts.size === 0) {
      warningShown = false;
    }
    
    // Reset redirect loop detection periodically
    if (now - Math.max(
      navigationCounts.timestamps['/login'] || 0,
      navigationCounts.timestamps['/dashboard'] || 0
    ) > 10000) {
      navigationCounts['/login'] = 0;
      navigationCounts['/dashboard'] = 0;
      redirectLoopDetected = false;
    }
  }, RESET_AFTER);
} 