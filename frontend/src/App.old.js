import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Business Center Components
import BusinessDashboard from './components/business/BusinessDashboard';
import BusinessAnalytics from './components/business/BusinessAnalytics';
import CompetitorIntelligence from './components/business/CompetitorIntelligence';
import BusinessSettings from './components/business/settings/BusinessSettings';

// Admin Components
import AdminPanel from './components/admin/AdminPanel';
import APISettings from './components/admin/APISettings';

// Settings Components
import SettingsLayout from './components/settings/SettingsLayout';
import ProfileSettings from './components/settings/ProfileSettings';
import GeneralSettings from './components/settings/GeneralSettings';

// Email Components
import EmailCompose from './components/email/EmailCompose';
import EmailTemplates from './components/email/EmailTemplates';
import EmailAnalytics from './components/email/EmailAnalytics';

// Auth Components
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Email Routes */}
          <Route path="email">
            <Route path="compose" element={
              <RequireAuth>
                <EmailCompose />
              </RequireAuth>
            } />
            <Route path="templates" element={
              <RequireAuth>
                <EmailTemplates />
              </RequireAuth>
            } />
            <Route path="analytics" element={
              <RequireAuth>
                <EmailAnalytics />
              </RequireAuth>
            } />
          </Route>

          {/* Business Center Routes */}
          <Route path="business">
            <Route index element={
              <RequireAuth>
                <BusinessDashboard />
              </RequireAuth>
            } />
            <Route path="analytics" element={
              <RequireAuth>
                <BusinessAnalytics />
              </RequireAuth>
            } />
            <Route path="competitors" element={
              <RequireAuth>
                <CompetitorIntelligence />
              </RequireAuth>
            } />
          </Route>

          {/* Settings Routes */}
          <Route path="settings" element={
            <RequireAuth>
              <SettingsLayout />
            </RequireAuth>
          }>
            <Route index element={<GeneralSettings />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="business" element={<BusinessSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }>
            <Route index element={<div>Admin Overview</div>} />
            <Route path="api-settings" element={<APISettings />} />
            <Route path="users" element={<div>User Management</div>} />
            <Route path="settings" element={<div>System Settings</div>} />
            <Route path="analytics" element={<div>Admin Analytics</div>} />
          </Route>

          {/* Default Route */}
          <Route index element={
            <RequireAuth>
              <BusinessDashboard />
            </RequireAuth>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;