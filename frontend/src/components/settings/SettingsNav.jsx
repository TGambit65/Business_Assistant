import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

/**
 * SettingsNav Component
 * 
 * Navigation sidebar for the settings page with tabs for different setting categories.
 */
const SettingsNav = ({ activeTab, handleTabChange }) => {
  // Define all available tabs
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'layout', label: 'Layout & Customization' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security & Privacy' },
    { id: 'admin', label: 'Admin Settings' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-left ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'hover:bg-muted'
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};

export default SettingsNav;
