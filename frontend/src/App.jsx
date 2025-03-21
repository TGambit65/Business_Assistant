import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import ThemeProvider from './contexts/ThemeContext';
import AuthProvider from './contexts/AuthContext';
import ToastProvider from './contexts/ToastContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/auth/OnboardingPage';

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
              />
              <Route 
                path="/settings" 
                element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
              />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App; 