import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useEnhancedAuth } from '../../auth';
import { useToast } from '../../contexts/ToastContext';
import { useFeatureInfo } from '../../hooks/useFeatureInfo';
import GoogleSignInModal from '../../components/auth/GoogleSignInModal';
import { Lock, Mail, AlertTriangle, Fingerprint, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';
import { isDemoMode } from '../../utils/envUtils';
import { useTheme } from '../../contexts/NewThemeContext';
import { useTranslation } from 'react-i18next';
import webAuthnService from '../../services/WebAuthnService';
import { analyticsService, AuthEvent } from '../../services/AnalyticsService';
import { getAccessibilityPreferences, announceToScreenReader } from '../../utils/accessibility';
import '../../styles/accessibility.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signInWithGoogle, requiresMfa, signInDemo } = useEnhancedAuth();
  const { success, error, info } = useToast();
  const { showFeatureInfo } = useFeatureInfo();
  const { setTheme, previousTheme } = useTheme();
  const { t, i18n } = useTranslation('auth');

  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for biometric authentication
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // State for language selection
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // State for accessibility
  // Load accessibility preferences but don't track changes in this component
  getAccessibilityPreferences(); // Apply preferences without storing in state

  // State for Google sign-in modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // State for container login attempts
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [usingDatabaseContainer, setUsingDatabaseContainer] = useState(false);

  // Get system dark mode preference
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Add the missing skipToContent function
  const skipToContent = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If main-content doesn't exist, focus on the first heading or interactive element
      const firstHeading = document.querySelector('h1, h2, h3, h4, h5, h6');
      const firstInteractive = document.querySelector('button, a, input, select, textarea');
      const elementToFocus = firstHeading || firstInteractive;
      
      if (elementToFocus) {
        elementToFocus.setAttribute('tabindex', '-1');
        elementToFocus.focus();
        elementToFocus.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Announce to screen readers
    announceToScreenReader('Skipped to main content');
  };

  // Set the login theme when the component mounts
  useEffect(() => {
    setTheme(isDarkMode ? 'loginThemeDark' : 'loginTheme');

    // Restore the previous theme when the component unmounts
    return () => {
      // Use the stored previous theme or fall back to system preference
      const themeToRestore = previousTheme || (isDarkMode ? 'dark' : 'light');
      setTheme(themeToRestore);
    };
  }, [setTheme, isDarkMode, previousTheme]);

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      const available = await webAuthnService.isBiometricAvailable();
      setBiometricAvailable(available);
    };

    checkBiometricAvailability();
  }, []);

  // Track page view for analytics
  useEffect(() => {
    analyticsService.trackPageView('login');
  }, []);

  // Check if we're using the specified database container and handle auto-login
  useEffect(() => {
    const checkDatabaseContainer = async () => {
      const containerId = localStorage.getItem('db_container_id');
      const databaseName = localStorage.getItem('database_name');
      const isUsingDb1 = containerId === '230065f663b90b63ac669e708144a92ae6b427c7703dcdcc546589fdc702287a' ||
                          databaseName === 'db-1';

      setUsingDatabaseContainer(isUsingDb1);

      // Only attempt auto-login if using the database container, in demo mode,
      // and hasn't attempted auto-login yet
      if (isUsingDb1 && isDemoMode() && !autoLoginAttempted && !isLoading) {
        setAutoLoginAttempted(true);
        
        try {
          setIsLoading(true);
          console.log('Auto-login for database container db-1');

          const result = await signInDemo();

          if (result && result.success) {
            localStorage.setItem('isAuthenticated', 'true');
            success('Login successful with database container db-1');
            navigate('/dashboard', { replace: true });
          } else {
            throw new Error(result?.error?.message || 'Unknown error during database login');
          }
        } catch (err) {
          console.error('Auto-login error:', err);
          error('Error during auto-login with database container');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkDatabaseContainer();
  }, [signInDemo, navigate, success, error, autoLoginAttempted, isLoading]);

  // Modified container login function to avoid duplicate attempts
  const handleContainerLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Manual login for database container db-1');

    try {
      const result = await signInDemo();

      if (result && result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success('Login successful with database container db-1');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error(result?.error?.message || 'Unknown error during database login');
      }
    } catch (err) {
      console.error('Manual container login error:', err);
      error('Error during login with database container');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      error(t('errors.invalid_credentials') || 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    // Track login attempt for analytics
    analyticsService.trackAuthEvent(AuthEvent.LOGIN_ATTEMPT, { email });

    try {
      const result = await login(email, password);

      if (result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success(t('biometric_auth_success') || 'Login successful');

        // Track successful login
        analyticsService.trackAuthEvent(AuthEvent.LOGIN_SUCCESS, { email });

        // Check if MFA is required
        if (requiresMfa) {
          // If MFA is required, show success message but don't redirect yet
          success(t('mfa.title') || 'Please complete two-factor authentication');

          // Announce to screen readers
          announceToScreenReader(t('mfa.title') || 'Two-factor authentication required');

          // Track MFA attempt
          analyticsService.trackAuthEvent(AuthEvent.MFA_ATTEMPT, { email });
        } else {
          // If MFA is not required, redirect to the dashboard
          const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath, { replace: true });
        }
      } else {
        error(result.error?.message || t('errors.invalid_credentials') || 'Login failed');

        // Track failed login
        analyticsService.trackAuthEvent(AuthEvent.LOGIN_FAILURE, {
          email,
          errorMessage: result.error?.message || 'Login failed'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      error(t('errors.unknown_error') || 'An unexpected error occurred');

      // Track failed login
      analyticsService.trackAuthEvent(AuthEvent.LOGIN_FAILURE, {
        email,
        errorMessage: err.message,
        errorType: err.type || 'unknown'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Track biometric auth attempt
      analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_ATTEMPT);
      
      const result = await webAuthnService.authenticate();
      
      if (result && result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success(t('biometric_auth_success') || 'Biometric authentication successful');
        
        // Track successful biometric login
        analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_SUCCESS);
        
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(result?.error || t('errors.biometric_failed') || 'Biometric authentication failed');
      }
    } catch (err) {
      console.error('Biometric authentication error:', err);
      error(err.message || t('errors.biometric_error') || 'An error occurred during biometric authentication');
      
      // Track biometric auth failure
      analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_FAILURE, {
        errorMessage: err.message || 'Biometric authentication error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setShowLanguageMenu(false);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleGoogleModal = () => {
    setShowGoogleModal(true);
  };

  const handleCloseGoogleModal = () => {
    setShowGoogleModal(false);
  };

  const handleContinueWithGoogle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Close the modal first
      setShowGoogleModal(false);
      
      // Track Google sign-in attempt
      analyticsService.trackAuthEvent(AuthEvent.GOOGLE_SIGNIN_ATTEMPT);
      
      // Attempt to sign in with Google
      const result = await signInWithGoogle();
      
      if (result && result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success(t('google_auth_success') || 'Google authentication successful');
        
        // Track successful Google sign-in
        analyticsService.trackAuthEvent(AuthEvent.GOOGLE_SIGNIN_SUCCESS);
        
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(result?.error || t('errors.google_failed') || 'Google authentication failed');
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      error(err.message || t('errors.google_error') || 'An error occurred during Google authentication');
      
      // Track Google sign-in failure
      analyticsService.trackAuthEvent(AuthEvent.GOOGLE_SIGNIN_FAILURE, {
        errorMessage: err.message || 'Google authentication error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = (e) => {
    if (isDemoMode()) {
      e.preventDefault();
      showFeatureInfo('directLogin');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {t('accessibility.skip_to_content')}
      </a>

      <div className="w-full max-w-md z-10 relative">
        {/* Language selector */}
        <div className="absolute top-2 right-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full p-0"
            aria-label={t('language.select')}
            title={t('language.select')}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          {showLanguageMenu && (
            <div className="absolute top-10 right-0 w-40 bg-card border border-border rounded-md shadow-md z-50">
              <div className="p-2">
                <button 
                  className={`w-full text-left px-2 py-1 rounded-sm ${currentLanguage === 'en' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </button>
                <button 
                  className={`w-full text-left px-2 py-1 rounded-sm ${currentLanguage === 'es' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}
                  onClick={() => handleLanguageChange('es')}
                >
                  Español
                </button>
                <button 
                  className={`w-full text-left px-2 py-1 rounded-sm ${currentLanguage === 'fr' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}
                  onClick={() => handleLanguageChange('fr')}
                >
                  Français
                </button>
                <button 
                  className={`w-full text-left px-2 py-1 rounded-sm ${currentLanguage === 'de' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}
                  onClick={() => handleLanguageChange('de')}
                >
                  Deutsch
                </button>
              </div>
            </div>
          )}
        </div>

        <Card id="main-content" tabIndex="-1" className="shadow-xl border-t-4 border-t-primary animate-fadeIn">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('fields.email')}
                </Label>
                <Input
                  id="email"
                  placeholder={t('placeholders.email')}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  aria-describedby="email-error"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t('fields.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder={t('placeholders.password')}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-describedby="password-error"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? t('accessibility.hide_password') : t('accessibility.show_password')}
                    tabIndex={-1} // Don't interrupt the tab flow
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('fields.remember_me')}
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('buttons.signing_in')}
                  </>
                ) : (
                  t('buttons.sign_in')
                )}
              </Button>

              {biometricAvailable && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleBiometricAuth}
                  disabled={isLoading}
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {t('buttons.use_biometric')}
                </Button>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleModal}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                {t('buttons.continue_with_google')}
              </Button>

              {/* Show database container login button only in dev or for database container users */}
              {(isDemoMode() || usingDatabaseContainer) && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full mt-2"
                  onClick={handleContainerLogin}
                  disabled={isLoading}
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                  {t('buttons.database_login')}
                </Button>
              )}
            </form>

            {/* Simplified version of this logic */}
            {isDemoMode() && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md mt-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium mb-1">{t('demo.title')}</p>
                    <p>{t('demo.message')}</p>
                    <div className="mt-2 flex flex-col space-y-2">
                      <div className="flex items-center">
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded mr-2 font-mono">demo@example.com</span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded font-mono">demopassword</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center space-y-2 text-muted-foreground">
              <div>
                <Link 
                  to="/reset-password" 
                  className="underline hover:text-primary"
                  onClick={handleDirectLogin}
                >
                  {t('links.forgot_password')}
                </Link>
              </div>
              <div>
                {t('links.no_account')}{' '}
                <Link 
                  to="/register" 
                  className="underline hover:text-primary"
                  onClick={handleDirectLogin}
                >
                  {t('links.sign_up')}
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal 
        isOpen={showGoogleModal} 
        onClose={handleCloseGoogleModal}
        onContinue={handleContinueWithGoogle}
        isLoading={isLoading}
      />
    </div>
  );
}
