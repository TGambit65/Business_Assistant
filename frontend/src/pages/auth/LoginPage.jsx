import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button'; // Assuming shadcn/ui Button
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'; // Assuming shadcn/ui Card
import { Input } from '../../components/ui/input'; // Assuming shadcn/ui Input
import { Label } from '../../components/ui/label'; // Assuming shadcn/ui Label
import { Checkbox } from '../../components/ui/checkbox'; // Assuming shadcn/ui Checkbox
import { useEnhancedAuth } from '../../auth';
import { useToast } from '../../contexts/ToastContext';
import GoogleSignInModal from '../../components/auth/GoogleSignInModal';
// import InstallPWAButton from '../../components/InstallPWAButton'; // Removed
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signInWithGoogle, requiresMfa } = useEnhancedAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    console.log('Login attempt started');

    try {
      const result = await login(email, password);
      console.log('Login result received:', result.success ? 'success' : 'failed');

      if (result.success) {
        localStorage.setItem('isAuthenticated', 'true');
        success('Login successful');
        console.log('Preparing navigation to dashboard');

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
        error(result.error?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
    // Use theme background, ensure full height, center content
    <div className="bg-background text-foreground px-4 py-12 min-h-screen flex items-center justify-center relative">
      {/* PWA Button Removed */}
      {/* <div className="absolute top-4 right-4 z-10">
        <InstallPWAButton />
      </div> */}

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Logo */}
          <img src="/logo192.png" alt="Business Assistant Logo" className="mx-auto h-16 w-auto mb-4" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Business Assistant</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground"> {/* Use muted foreground */}
            Sign in to manage your inbox smarter
          </p>
        </div>

        {/* Developer Tools Section */}
        {process.env.NODE_ENV !== 'production' && (
          <Card className="mb-4 border-yellow-500 border-2 bg-yellow-50 dark:bg-yellow-900/30">
            <CardHeader>
              <CardTitle className="text-yellow-700 dark:text-yellow-300 text-lg">Developer Tools</CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-400">For testing purposes only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
            {/* Use secondary/outline buttons */}
            <Button
              variant="primary" // Changed to primary for more color
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleDirectLogin}
            >
              Quick Login (Dev Mode)
            </Button>
            {/* Style links as secondary buttons */}
            <a
              href="/force-dashboard.html"
              className="inline-block w-full text-center" // Let Button component handle styling via variant
            >
              <Button variant="primary" className="w-full bg-green-600 hover:bg-green-700 text-white">Force Dashboard Access</Button>
            </a>
            <a
              href="/standalone-dashboard.html"
              className="inline-block w-full text-center"
            >
              <Button variant="primary" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Standalone Dashboard</Button>
            </a>
            </CardContent>
          </Card>
        )}

        {/* Main Login Card */}
        <Card> {/* Should inherit theme styles */}
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Use Label component */}
                <Label htmlFor="email">
                  <Mail className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Email
                </Label>
                {/* Use Input component - should inherit theme styles */}
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Use Label component */}
                  <Label htmlFor="password">
                    <Lock className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Password
                  </Label>
                  {/* Style link with primary color */}
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary/90"
                  >
                    Forgot password?
                  </Link>
                </div>
                 {/* Use Input component */}
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm">
                {/* Use Checkbox component */}
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)} // Fixed to use onChange instead of onCheckedChange
                  aria-describedby="remember-me-description"
                  className="border-2 border-primary"
                />
                <Label htmlFor="remember" className="text-sm font-semibold text-primary"> {/* Made text more visible and colorful */}
                  Remember me
                </Label>
              </div>
              {/* Removed redundant description - aria-describedby handles it */}
              {/* <p id="remember-me-description" className="text-xs text-gray-500 dark:text-gray-400">Keep me signed in on this device.</p> */}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Ensure Button uses primary styles */}
              <Button
                type="submit"
                className="w-full py-3 text-base" // Let Button component handle bg/text color via default variant
                disabled={isLoading}
              >
                {/* Using Mail icon for consistency */}
                <Mail className="mr-2 h-5 w-5" />
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </Button>

              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-border"></div> {/* Use theme border */}
                <span className="mx-4 flex-shrink text-muted-foreground text-sm">or</span> {/* Use muted foreground */}
                <div className="flex-grow border-t border-border"></div> {/* Use theme border */}
              </div>

              {/* Ensure Button uses outline styles */}
              <Button
                type="button"
                variant="outline" // Use theme-aware variant
                className="w-full py-3 text-base" // Let Button component handle styling
                onClick={handleGoogleModal}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"> {/* Google Icon */}
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
                </svg>
                Sign in with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Google Sign In Modal */}
      {showGoogleModal && (
        <GoogleSignInModal
          onContinue={handleContinueWithGoogle}
          onClose={handleCloseGoogleModal}
        />
      )}
    </div>
  );
}