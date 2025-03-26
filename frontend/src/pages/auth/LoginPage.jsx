import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFeatureInfo } from '../../hooks/useFeatureInfo';
import GoogleSignInModal from '../../components/auth/GoogleSignInModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { success, error, info } = useToast();
  const { showFeatureInfo } = useFeatureInfo();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      error('Please enter your email');
      return;
    }
    
    if (!password) {
      error('Please enter at least one character for password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For demo, we'll always succeed with any email/password
      // In a real app, we would call an API to validate
      const result = { success: true };
      
      if (result.success) {
        success('Login successful');
        info('AI is automatically sorting your emails...');
        
        // Give a small delay before navigating to dashboard
        // This allows the user to see the sorting notification
        setTimeout(() => {
          navigate('/dashboard');
          success('Emails have been sorted using multiple AI models for optimal efficiency');
        }, 1000);
      } else {
        error(result.error || 'Login failed');
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
    
    try {
      info('Connecting to Google Workspace...');
      
      const result = await loginWithGoogle();
      
      if (result.success) {
        success('Google Sign-in successful');
        info('AI is automatically sorting your emails using multi-model approach...');
        
        // Give a small delay before navigating to dashboard
        setTimeout(() => {
          navigate('/dashboard');
          success('Your Google Workspace has been fully connected', {
            duration: 3000,
            title: 'Connected Successfully'
          });
          success('Emails have been sorted using multiple AI models for optimal efficiency');
        }, 1000);
      } else {
        error(result.error || 'Google Sign-in failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      error('An error occurred during Google Sign-in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Business Assistant</h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your inbox smarter
          </p>
          <div className="mt-2 inline-block bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-xs font-medium text-yellow-800 dark:text-yellow-200">
            DEMO APPLICATION
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="•"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
                  required
                />
                <p className="text-xs text-gray-500 italic">For demo purposes, just enter a single letter</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Try Google Sign-in:</span> For the best experience, we recommend using the Google Sign-in option below to access Gmail integration features.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="flex justify-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  New here?{' '}
                  <button 
                    type="button"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    onClick={() => showFeatureInfo('registrationProcess')}
                  >
                    Register for an account
                  </button>
                </span>
              </div>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="mx-4 flex-shrink text-gray-600 dark:text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleModal}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>

              <div className="mt-4 flex justify-center">
                <button 
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => showFeatureInfo('envSecurity')}
                >
                  Security Information
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2">Coming Soon: Mobile App</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            We're currently optimizing for mobile web, but a dedicated mobile app will be available 
            after our SaaS service launches. Get all the same powerful features on the go!
          </p>
        </div>
      </div>
      
      {showGoogleModal && (
        <GoogleSignInModal
          onClose={handleCloseGoogleModal}
          onContinue={handleContinueWithGoogle}
        />
      )}
    </div>
  );
} 