import React from 'react';
import { Button } from '../ui/button';

const GoogleSignInModal = ({ isOpen, onContinue, onClose }) => {
  // Don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto google-signin-overlay">
      <div className="bg-background dark:bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Connect with Google</h1>
            <p className="text-gray-700 dark:text-gray-200">
              Connect your Google account to access enhanced email features
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Account Access</h2>
            <p className="text-gray-700 dark:text-gray-200">
              Business Assistant will request access to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-200">
              <li>Your Gmail account</li>
              <li>Basic profile information</li>
              <li>Calendar access (optional)</li>
            </ul>
          </div>
          
          <div className="bg-muted dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-md font-medium text-foreground dark:text-white mb-2">Your data is secure</h3>
            <p className="text-gray-700 dark:text-gray-200">
              We use industry-standard security measures to protect your information.
              You can revoke access at any time.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 pt-2">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={onContinue} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
