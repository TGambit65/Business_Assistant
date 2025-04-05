import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import { ThemeProvider } from './contexts/NewThemeContext';
import { ToastProvider } from './contexts/ToastContext';
// Import EnhancedAuthProvider instead of AuthProvider
import { EnhancedAuthProvider } from './auth';
import LoginPage from './pages/auth/LoginPage';
import LoginBypass from './pages/auth/LoginBypass';
import OnboardingPage from './pages/auth/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DirectDashboardAccess from './pages/dashboard/DirectDashboardAccess';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/settings/ProfilePage';
import SecuritySettingsPage from './pages/settings/SecuritySettingsPage';
import AdministrationPage from './pages/admin/AdministrationPage';
import ThemeManager from './pages/ThemeManager';
import BusinessCenterPage from './pages/business/BusinessCenterPage';
import FaviconLoader from './components/common/FaviconLoader';
import SearchResultsPage from './pages/SearchResultsPage';

import ComposePage from './pages/email/ComposePage';
import DraftGeneratorPage from './pages/email/DraftGeneratorPage';
import TemplatesPage from './pages/email/TemplatesPage';
import InboxPage from './pages/email/InboxPage';
import EmailRulesPage from './pages/email/EmailRulesPage';
import SignaturePage from './pages/email/SignaturePage';
import { startResourceMonitoring } from './utils/resourceMonitor';
import { registerGlobalDebugTools, setupPerformanceMonitoring } from './utils/debugTools';
import { setupNetworkInterceptor } from './utils/networkInterceptor';
import { setupRenderGuardCleanup } from './utils/renderGuard';
// Import SecureRoute from our enhanced auth system
import { SecureRoute, AuthIntegration } from './auth';
import './styles/resource-optimization.css';

// Enhanced Protected Route Component
// We're using the SecureRoute component from our enhanced auth system
// This component handles authentication checks and MFA requirements
const ProtectedRoute = ({ children, requireMfa = false }) => {
  // For backward compatibility, we'll keep the same component name
  // but use our enhanced SecureRoute internally
  return (
    <SecureRoute requireMfa={requireMfa}>
      {children}
    </SecureRoute>
  );
};

function App() {
  // Start resource monitoring when the app loads
  useEffect(() => {
    console.log('Starting resource monitoring');

    // Suppress benign ResizeObserver loop error in development
    if (process.env.NODE_ENV !== 'production') {
      const resizeObserverErrMsg = 'ResizeObserver loop completed with undelivered notifications.';
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes(resizeObserverErrMsg)) {
          return;
        }
        originalConsoleError(...args);
      };
    }

    // The startResourceMonitoring function returns a cleanup function
    const stopMonitoring = startResourceMonitoring();

    // Set up network interceptor to prevent request flooding
    setupNetworkInterceptor();

    // Set up render guard to detect infinite loops
    setupRenderGuardCleanup();

    // Set up debug tools
    if (process.env.NODE_ENV !== 'production') {
      registerGlobalDebugTools();
      setupPerformanceMonitoring();
    }

    // Clean up when the component unmounts
    return () => {
      console.log('Stopping resource monitoring');
      stopMonitoring();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <FaviconLoader />
          <Router>
            <EnhancedAuthProvider>
              <AuthIntegration>
                <Suspense fallback={<LoadingState fullScreen message="Loading application..." />}>
                  <Routes>
                  {/* Direct access routes - bypass authentication */}
                  <Route path="/direct-dashboard" element={<DirectDashboardAccess />} />

                  {/* Standalone login and onboarding pages */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/login-bypass" element={<LoginBypass />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />

                  {/* Normal routes with layout and authentication */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<ProtectedRoute requireMfa={false}><DashboardPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute requireMfa={true}><SettingsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute requireMfa={true}><ProfilePage /></ProtectedRoute>} />
                    <Route path="/security-settings" element={<ProtectedRoute requireMfa={true}><SecuritySettingsPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute requireMfa={true}><AdministrationPage /></ProtectedRoute>} />
                    <Route path="/theme-manager" element={<ThemeManager />} />
                    <Route path="/business-center" element={<ProtectedRoute requireMfa={false}><BusinessCenterPage /></ProtectedRoute>} />
                    <Route path="/search" element={<ProtectedRoute requireMfa={false}><SearchResultsPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute requireMfa={false}><AnalyticsPage /></ProtectedRoute>} />

                    <Route path="/email/compose" element={<ProtectedRoute><ComposePage /></ProtectedRoute>} />
                    <Route path="/email/draft-generator" element={<ProtectedRoute><DraftGeneratorPage /></ProtectedRoute>} />
                    <Route path="/email/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
                    <Route path="/email/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                    <Route path="/email/rules" element={<ProtectedRoute><EmailRulesPage /></ProtectedRoute>} />
                    <Route path="/email/signature" element={<ProtectedRoute><SignaturePage /></ProtectedRoute>} />
                  </Route>
                  </Routes>
                </Suspense>
              </AuthIntegration>
            </EnhancedAuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
