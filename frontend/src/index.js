import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import PerformanceMonitor from './utils/PerformanceMonitor';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initPolyfills } from './utils/browserPolyfills';

// Initialize browser polyfills for compatibility
initPolyfills();

// Force light theme
document.documentElement.classList.remove('dark');

// Apply light theme CSS variables
localStorage.setItem('theme', 'light');

// Initialize performance monitoring
PerformanceMonitor.initPerformanceMonitoring();

// Error boundary for unhandled errors
const handleGlobalError = (event) => {
  console.error('Unhandled error:', event.error || event.message);

  // Log to analytics or monitoring service (if available)
  if (PerformanceMonitor && PerformanceMonitor.reportError) {
    PerformanceMonitor.reportError(event.error || new Error(event.message));
  }

  // Prevent default browser error handling
  event.preventDefault();

  // If it's a critical error, show a user-friendly error message
  if (event.error && event.error.isCritical) {
    showErrorNotification('An error occurred. Please refresh the page or try again later.');
  }
};

// Handle uncaught promise rejections
const handleUnhandledRejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Log to analytics or monitoring service (if available)
  if (PerformanceMonitor && PerformanceMonitor.reportError) {
    PerformanceMonitor.reportError(event.reason || new Error('Unhandled promise rejection'));
  }
};

// Add global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Show error notification to user
const showErrorNotification = (message) => {
  // Check if notification already exists
  const existingNotification = document.querySelector('.error-notification');
  if (existingNotification) {
    return;
  }

  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="error-content">
      <p>${message}</p>
      <button id="error-dismiss">Dismiss</button>
    </div>
  `;
  document.body.appendChild(notification);

  // Handle dismiss button click
  document.getElementById('error-dismiss').addEventListener('click', () => {
    notification.remove();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
};

// Function to safely render the React app
const renderApp = () => {
  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    showErrorNotification('Failed to load the application. Please refresh the page.');
  }
};

// Initialize the app
renderApp();

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => console.log('Service worker registered successfully. App is ready for offline use.'),
  onUpdate: (registration) => {
    // Create custom notification for updates
    const updateAvailable = window.confirm(
      'A new version of the Email Assistant is available! Click OK to update now or Cancel to update later.'
    );
    
    if (updateAvailable && registration.waiting) {
      // Send message to service worker to skip waiting and apply updates immediately
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals((metric) => {
  // Log web vitals to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && PerformanceMonitor && PerformanceMonitor.reportWebVital) {
    PerformanceMonitor.reportWebVital(metric);
  }
});
