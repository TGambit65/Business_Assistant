import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '../../auth';

// Import the settings components
import SettingsNav from '../../components/settings/SettingsNav';
import GeneralSettings from '../../components/settings/GeneralSettings';
import AppearanceSettings from '../../components/settings/AppearanceSettings';
import LayoutSettings from '../../components/settings/LayoutSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import AdminSettings from '../../components/settings/AdminSettings';

/**
 * SettingsPageRefactored Component
 * 
 * A refactored version of the settings page that uses separate components for each section.
 * This approach makes the code more maintainable and keeps files under 500 lines.
 */
export default function SettingsPageRefactored() {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('general');
  
  // Load users data for admin tab
  useEffect(() => {
    // Only load users if admin tab is active and user has admin role
    if (activeTab === 'admin' && user?.role === 'admin') {
      // This would be handled in the AdminSettings component
    }
  }, [activeTab, user?.role]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Special case for security tab - navigate to dedicated page
    if (tab === 'security') {
      navigate('/security-settings');
    }
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings user={user} />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'layout':
        return <LayoutSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'admin':
        return user?.role === 'admin' ? <AdminSettings /> : null;
      default:
        return <GeneralSettings user={user} />;
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <SettingsNav 
            activeTab={activeTab} 
            handleTabChange={handleTabChange}
            userRole={user?.role}
          />
        </div>
        
        {/* Settings Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
