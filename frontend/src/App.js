import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout
import MainLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import EmailRulesPage from './pages/email/EmailRulesPage';
import TemplatesPage from './pages/email/TemplatesPage';
import ComposePage from './pages/email/ComposePage';
import InboxPage from './pages/email/InboxPage';
import EmailDetailPage from './pages/email/EmailDetailPage';
import SignaturePage from './pages/email/SignaturePage';
import DraftGeneratorPage from './pages/email/DraftGeneratorPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

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
              
              {/* Protected routes with layout */}
              <Route element={<MainLayout><Outlet /></MainLayout>}>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/email/compose" element={<ProtectedRoute><ComposePage /></ProtectedRoute>} />
                <Route path="/email/rules" element={<ProtectedRoute><EmailRulesPage /></ProtectedRoute>} />
                <Route path="/email/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
                <Route path="/email/signatures" element={<ProtectedRoute><SignaturePage /></ProtectedRoute>} />
                <Route path="/email/draft-generator" element={<ProtectedRoute><DraftGeneratorPage /></ProtectedRoute>} />
                <Route path="/email/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                <Route path="/email/detail/:emailId" element={<ProtectedRoute><EmailDetailPage /></ProtectedRoute>} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;