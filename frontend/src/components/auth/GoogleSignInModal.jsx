import React from 'react';
import { Button } from '../ui/button';

const GoogleSignInModal = ({ onContinue, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">Unlock the Full Power of Business Assistant with Google Workspace</h1>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Enhanced Productivity</h2>
            <p className="text-gray-600 dark:text-gray-300">
              By connecting Business Assistant to your Google Workspace account, you'll experience a 
              seamlessly integrated communication hub designed specifically for professional teams. 
              This authorized connection enables advanced features that transform how you manage email.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Advantages for Google Workspace Users</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Smart Email Management</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Multi-model AI sorting automatically organizes your inbox using cost-optimized intelligence</li>
                  <li>Synchronized Gmail labels with bi-directional updates</li>
                  <li>Direct access to multiple Gmail accounts in one unified interface</li>
                  <li>Context-aware search across your entire workspace</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Seamless Collaboration</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Team inbox management for departmental emails (support@, info@)</li>
                  <li>Assign emails to team members with tracking and notifications</li>
                  <li>Collaborative email drafting with real-time editing</li>
                  <li>Approval workflows for outgoing communications</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Calendar & Scheduling Intelligence</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>One-click meeting creation from email content</li>
                  <li>AI scheduling assistant finds optimal meeting times</li>
                  <li>Automatic Google Meet link generation</li>
                  <li>Smart follow-up scheduling after calendar events</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Document Integration</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Attach Google Drive files with advanced permissions</li>
                  <li>Email-to-document workflow for important communications</li>
                  <li>Contextual document suggestions based on email content</li>
                  <li>Company template library synced from Google Drive</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Enterprise Security</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>All data protected with enterprise-grade encryption</li>
                  <li>Compliance with Google Workspace security standards</li>
                  <li>Data residency controls aligned with your organization</li>
                  <li>Optional DLP (Data Loss Prevention) scanning</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-primary mb-2">Analytics Dashboard</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Team and individual email productivity metrics</li>
                  <li>Response time analytics for performance tracking</li>
                  <li>Communication pattern insights for process improvement</li>
                  <li>Customizable reports for different stakeholders</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Your Data, Your Control</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Business Assistant requests only the permissions needed to deliver these features. 
              You maintain complete control over your data, with the ability to revoke access at any time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button onClick={onContinue} className="bg-primary hover:bg-primary/90 text-white">
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