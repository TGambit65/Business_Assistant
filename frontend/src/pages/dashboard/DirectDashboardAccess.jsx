import React, { useEffect } from 'react';
import DashboardPage from './DashboardPage';

/**
 * This component directly renders the Dashboard without authentication checks
 * It's meant as a fallback when the normal protected routes aren't working
 */
const DirectDashboardAccess = () => {
  useEffect(() => {
    // Set authenticated state in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    
    // Mock user data
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    console.log('DirectDashboardAccess: Authentication set');
  }, []);
  
  return (
    <div className="direct-dashboard-access">
      {/* Render a banner at the top to indicate we're in direct access mode */}
      <div 
        style={{
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        Direct Dashboard Access Mode (Authentication Bypassed)
      </div>
      
      {/* Directly render the dashboard component */}
      <DashboardPage />
    </div>
  );
};

export default DirectDashboardAccess; 