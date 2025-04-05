/**
 * Security Settings Component
 * 
 * Component for managing security settings like MFA, device management, etc.
 */

import React, { useState, useEffect } from 'react';
import { DeviceFingerprint } from '../../types/enhancedSecurity';
import PasswordChange from './PasswordChange';

const SecuritySettings: React.FC = () => {
    const [activeDevices, setActiveDevices] = useState<DeviceFingerprint[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'devices' | 'mfa' | 'password'>('general');
  
  // Load security settings
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        // In a real implementation, this would load actual devices and settings
        // For now, we'll just simulate some data
        
        // Simulate loading devices
        const mockDevices: DeviceFingerprint[] = [
          {
            id: 'current-device-id',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            colorDepth: window.screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
            lastSeen: Date.now()
          },
          {
            id: 'other-device-id-1',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
            platform: 'iPhone',
            screenResolution: '390x844',
            colorDepth: 24,
            timezone: 'America/Los_Angeles',
            language: 'en-US',
            createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
            lastSeen: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
          }
        ];
        
        setActiveDevices(mockDevices);
        
        // Simulate MFA status
        setMfaEnabled(false);
      } catch (err) {
        console.error('Error loading security settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSecuritySettings();
  }, []);
  
  // Toggle MFA
  const handleToggleMfa = async () => {
    try {
      // In a real implementation, this would enable/disable MFA
      // For now, we'll just toggle the state
      setMfaEnabled(!mfaEnabled);
    } catch (err) {
      console.error('Error toggling MFA:', err);
    }
  };
  
  // Remove device
  const handleRemoveDevice = async (deviceId: string) => {
    try {
      // In a real implementation, this would remove the device
      // For now, we'll just filter it out
      setActiveDevices(activeDevices.filter(device => device.id !== deviceId));
    } catch (err) {
      console.error('Error removing device:', err);
    }
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get device name
  const getDeviceName = (device: DeviceFingerprint) => {
    const isCurrent = device.id === localStorage.getItem('current_device_id');
    
    if (device.platform.includes('iPhone') || device.userAgent.includes('iPhone')) {
      return `${isCurrent ? 'Current ' : ''}iPhone`;
    } else if (device.platform.includes('Android') || device.userAgent.includes('Android')) {
      return `${isCurrent ? 'Current ' : ''}Android Device`;
    } else if (device.platform.includes('Win') || device.userAgent.includes('Windows')) {
      return `${isCurrent ? 'Current ' : ''}Windows PC`;
    } else if (device.platform.includes('Mac') || device.userAgent.includes('Mac')) {
      return `${isCurrent ? 'Current ' : ''}Mac`;
    } else if (device.platform.includes('Linux') || device.userAgent.includes('Linux')) {
      return `${isCurrent ? 'Current ' : ''}Linux PC`;
    } else {
      return `${isCurrent ? 'Current ' : ''}Unknown Device`;
    }
  };
  
  if (isLoading) {
    return <div>Loading security settings...</div>;
  }
  
  return (
    <div className="security-settings">
      <h2>Security Settings</h2>
      
      <div className="security-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`tab-button ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Devices
        </button>
        <button 
          className={`tab-button ${activeTab === 'mfa' ? 'active' : ''}`}
          onClick={() => setActiveTab('mfa')}
        >
          Two-Factor Authentication
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'general' && (
          <div className="general-settings">
            <h3>General Security Settings</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Account Security Level</h4>
                <p>Your account security is currently {mfaEnabled ? 'strong' : 'basic'}.</p>
              </div>
              <div className="setting-action">
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('mfa')}
                >
                  Enhance Security
                </button>
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Session Management</h4>
                <p>You are currently logged in on {activeDevices.length} device(s).</p>
              </div>
              <div className="setting-action">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('devices')}
                >
                  Manage Devices
                </button>
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Password</h4>
                <p>Last changed: Never</p>
              </div>
              <div className="setting-action">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('password')}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'devices' && (
          <div className="device-settings">
            <h3>Active Devices</h3>
            
            <div className="device-list">
              {activeDevices.map(device => (
                <div key={device.id} className="device-item">
                  <div className="device-info">
                    <h4>{getDeviceName(device)}</h4>
                    <p>Last active: {formatDate(device.lastSeen)}</p>
                    <p>Browser: {device.userAgent.split(' ').slice(-1)[0]}</p>
                    <p>Location: Unknown</p>
                  </div>
                  <div className="device-actions">
                    {device.id === localStorage.getItem('current_device_id') ? (
                      <span className="current-device-badge">Current Device</span>
                    ) : (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="btn btn-warning">Sign Out From All Devices</button>
          </div>
        )}
        
        {activeTab === 'mfa' && (
          <div className="mfa-settings">
            <h3>Two-Factor Authentication</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>
                  {mfaEnabled 
                    ? 'Two-factor authentication is enabled. This adds an extra layer of security to your account.' 
                    : 'Two-factor authentication is disabled. Enable it to add an extra layer of security to your account.'}
                </p>
              </div>
              <div className="setting-action">
                <button 
                  className={`btn ${mfaEnabled ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleToggleMfa}
                >
                  {mfaEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            
            {!mfaEnabled && (
              <div className="mfa-setup-info">
                <h4>How Two-Factor Authentication Works</h4>
                <p>
                  When you enable two-factor authentication, you'll need to enter a verification code
                  in addition to your password when signing in. This adds an extra layer of security
                  to your account.
                </p>
                <ol>
                  <li>Download an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code that will be displayed when you enable two-factor authentication</li>
                  <li>Enter the verification code from the app to complete setup</li>
                </ol>
              </div>
            )}
            
            {mfaEnabled && (
              <div className="recovery-codes">
                <h4>Recovery Codes</h4>
                <p>
                  Recovery codes can be used to access your account if you lose your phone or cannot
                  access your authenticator app.
                </p>
                <button className="btn btn-secondary">View Recovery Codes</button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="password-settings">
            <PasswordChange />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
