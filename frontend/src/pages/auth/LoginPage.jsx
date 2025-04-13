import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useEnhancedAuth } from '../../auth';
import { useToast } from '../../contexts/ToastContext';
import GoogleSignInModal from '../../components/auth/GoogleSignInModal';
import { Lock, Mail, AlertTriangle, Fingerprint, Globe, Eye, EyeOff } from 'lucide-react';
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

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      info(t('biometric_not_available') || 'Biometric authentication is not available on this device');
      return;
    }

    setIsLoading(true);

    // Track biometric attempt
    analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_ATTEMPT);

    try {
      // Get username from email field if available
      const username = email || '';

      const result = await webAuthnService.authenticate(username);

      if (result.success && result.token) {
        // Track successful biometric login
        analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_SUCCESS);

        success(t('biometric_auth_success') || 'Biometric authentication successful');
        navigate('/dashboard');
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (err) {
      console.error('Biometric auth error:', err);
      error(t('biometric_auth_failure') || 'Biometric authentication failed');

      // Track failed biometric login
      analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_FAILURE, {
        errorMessage: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setShowLanguageMenu(false);

    // Update document direction for RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    document.documentElement.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
  };

  const handleGoogleModal = () => {
    setShowGoogleModal(true);
  };

  const handleCloseGoogleModal = () => {
    setShowGoogleModal(false);
  };

  const handleContinueWithGoogle = async () => {
    setShowGoogleModal(false);
    setIsLoading(true);
    console.log('Google sign-in attempt started');

    try {
      info('Connecting to Google Workspace...');
      const result = await signInWithGoogle();
      console.log('Google sign-in result received:', result.success ? 'success' : 'failed');

      if (result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success('Google Sign-in successful');
        console.log('Preparing navigation to dashboard after Google sign-in');

        // Check if MFA is required
        if (requiresMfa) {
          // If MFA is required, show success message but don't redirect yet
          // The AuthIntegration component will handle showing the MFA verification screen
          success('Please complete two-factor authentication');
        } else {
          // If MFA is not required, redirect to the dashboard
          const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          console.log(`Redirecting to: ${redirectPath}`);
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath, { replace: true });
        }
      } else {
        error(result.error?.message || 'Google Sign-in failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      error('An error occurred during Google Sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the one-click login button
  const handleDirectLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('isAuthenticated', 'true');
    console.log('Direct login - bypassing authentication');
    window.location.href = '/dashboard'; // Simple redirect for dev
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="w-full max-w-md space-y-8 p-8">
        <Card className="border-border shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden transform transition-all hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>

          <CardHeader className="space-y-1 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg">
                <img
                  src="/logo192.png"
                  alt="Logo"
                  className="h-full w-full rounded-full bg-white dark:bg-gray-800 p-2"
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {t('welcome_back')}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {t('sign_in_to_account')}
            </CardDescription>

            {/* Language selector */}
            <div className="flex justify-center mt-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={showLanguageMenu}
                >
                  <Globe className="h-3 w-3" />
                  <span>{currentLanguage.toUpperCase()}</span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 shadow-md rounded-md py-1 z-50 min-w-[120px] max-h-[200px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('es')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Español
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('fr')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Français
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('de')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Deutsch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('pt')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Português
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('ru')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Русский
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('zh')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      中文
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('ja')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      日本語
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('ar')}
                      className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      العربية
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t('password')}
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    {t('forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    disabled={isLoading}
                    required
                    aria-describedby="password-requirements"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('remember_me')}
                  </label>
                </div>

                {biometricAvailable && (
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                    disabled={isLoading}
                  >
                    <Fingerprint className="h-3 w-3" />
                    <span>{t('biometric_auth')}</span>
                  </button>
                )}
              </div>

              {/* Skip link for accessibility */}
              <a
                href="#main-content"
                onClick={skipToContent}
                className="skip-to-content"
              >
                Skip to main content
              </a>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                disabled={isLoading}
                aria-live="polite"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('signing_in')}
                  </>
                ) : (
                  t('sign_in')
                )}
              </Button>

              <div className="relative flex items-center justify-center mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  {t('or_continue_with')}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleModal}
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-2 px-4 rounded-md shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                  {t('google')}
                </Button>

                {usingDatabaseContainer && (
                  <Button
                    type="button"
                    onClick={handleContainerLogin}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? t('signing_in') : t('database_container')}
                  </Button>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <Button
                    type="button"
                    onClick={handleDirectLogin}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    {t('developer_login')}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 relative z-10">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {t('no_account')}{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                {t('sign_up')}
              </Link>
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t('development_mode')}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={handleCloseGoogleModal}
        onContinue={handleContinueWithGoogle}
      />
    </div>
  );
}
