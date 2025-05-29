import { lazy } from 'react';
import { createLazyComponent } from '../components/performance/OptimizedComponents';

/**
 * Lazy loaded route components
 * Each route is loaded only when accessed, reducing initial bundle size
 */

// Auth routes
export const LoginPage = createLazyComponent(
  () => import('../pages/auth/LoginPage'),
  'Loading login...'
);

export const OnboardingPage = createLazyComponent(
  () => import('../pages/auth/OnboardingPage'),
  'Loading onboarding...'
);

// Dashboard routes
export const DashboardPage = createLazyComponent(
  () => import('../pages/dashboard/DashboardPage'),
  'Loading dashboard...'
);

export const AnalyticsPage = createLazyComponent(
  () => import('../pages/dashboard/AnalyticsPage'),
  'Loading analytics...'
);

// Email routes
export const InboxPage = createLazyComponent(
  () => import('../pages/email/InboxPage'),
  'Loading inbox...'
);

export const ComposePage = createLazyComponent(
  () => import('../pages/email/ComposePage'),
  'Loading compose...'
);

export const TemplatesPage = createLazyComponent(
  () => import('../pages/email/TemplatesPage'),
  'Loading templates...'
);

export const DraftGeneratorPage = createLazyComponent(
  () => import('../pages/email/DraftGeneratorPage'),
  'Loading draft generator...'
);

export const EmailRulesPage = createLazyComponent(
  () => import('../pages/email/EmailRulesPage'),
  'Loading email rules...'
);

export const SignaturePage = createLazyComponent(
  () => import('../pages/email/SignaturePage'),
  'Loading signatures...'
);

// Business routes
export const BusinessCenterPage = createLazyComponent(
  () => import('../pages/business/BusinessCenterPage'),
  'Loading business center...'
);

// Settings routes
export const SettingsPage = createLazyComponent(
  () => import('../pages/settings/SettingsPage'),
  'Loading settings...'
);

export const ProfilePage = createLazyComponent(
  () => import('../pages/settings/ProfilePage'),
  'Loading profile...'
);

export const SecuritySettingsPage = createLazyComponent(
  () => import('../pages/settings/SecuritySettingsPage'),
  'Loading security settings...'
);

export const IntegrationsPage = createLazyComponent(
  () => import('../pages/settings/IntegrationsPage'),
  'Loading integrations...'
);

export const UserPreferencesPage = createLazyComponent(
  () => import('../pages/settings/UserPreferencesPage'),
  'Loading preferences...'
);

export const BiometricCredentialsPage = createLazyComponent(
  () => import('../pages/settings/BiometricCredentialsPage'),
  'Loading biometric settings...'
);

export const APISettingsPage = createLazyComponent(
  () => import('../pages/settings/APISettingsPage'),
  'Loading API settings...'
);

// Admin routes
export const AdministrationPage = createLazyComponent(
  () => import('../pages/admin/AdministrationPage'),
  'Loading administration...'
);

// Utility routes
export const NotFoundPage = createLazyComponent(
  () => import('../pages/NotFoundPage'),
  'Loading...'
);

export const SearchResultsPage = createLazyComponent(
  () => import('../pages/SearchResultsPage'),
  'Loading search results...'
);

export const ThemeManager = createLazyComponent(
  () => import('../pages/ThemeManager'),
  'Loading theme manager...'
);

/**
 * Heavy components that should be lazy loaded
 */

// Business components
export const CompetitorIntelligence = lazy(
  () => import('../components/business/CompetitorIntelligence')
);

export const MarketTrendChart = lazy(
  () => import('../components/business/MarketTrendChart')
);

export const IndustryNewsDashboard = lazy(
  () => import('../components/business/IndustryNewsDashboard')
);

export const ProductResearchReport = lazy(
  () => import('../components/business/ProductResearchReport')
);

// Dashboard components
export const AIEmailAnalyticsDashboard = lazy(
  () => import('../components/dashboard/AIEmailAnalyticsDashboard')
);

export const AnalyticsDashboard = lazy(
  () => import('../components/dashboard/AnalyticsDashboard')
);

// Email components
export const AIEmailAssistant = lazy(
  () => import('../components/email/AIEmailAssistant.jsx')
);

export const EmailEditor = lazy(
  () => import('../components/email/EmailEditor.jsx')
);

export const TemplateEditor = lazy(
  () => import('../components/email/TemplateEditor')
);

/**
 * Preload critical routes
 * Call this after the initial render to preload likely next routes
 */
export function preloadCriticalRoutes() {
  // Preload dashboard since it's likely the next destination after login
  import('../pages/dashboard/DashboardPage');
  
  // Preload inbox as it's a common destination
  import('../pages/email/InboxPage');
  
  // Preload compose for quick access
  import('../pages/email/ComposePage');
}

/**
 * Route-based preloading
 * Preload routes based on the current route
 */
export function preloadRelatedRoutes(currentPath: string) {
  if (currentPath === '/login') {
    // User is likely to go to dashboard after login
    import('../pages/dashboard/DashboardPage');
  } else if (currentPath === '/dashboard') {
    // Preload commonly accessed pages from dashboard
    import('../pages/email/InboxPage');
    import('../pages/email/ComposePage');
    import('../components/dashboard/AIEmailAnalyticsDashboard');
  } else if (currentPath.startsWith('/email')) {
    // Preload other email-related pages
    import('../pages/email/TemplatesPage');
    import('../components/email/AIEmailAssistant.jsx');
  } else if (currentPath.startsWith('/settings')) {
    // Preload other settings pages
    import('../pages/settings/SecuritySettingsPage');
    import('../pages/settings/UserPreferencesPage');
  }
}