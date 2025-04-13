import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Shield, AlertTriangle, Key, Smartphone, Clock, Lock } from 'lucide-react';

/**
 * SecuritySettings Component
 * 
 * Settings for password, two-factor authentication, and privacy.
 */
const SecuritySettings = () => {
  // State for form values
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState({
    activityVisible: true,
    profileSearchable: true,
    dataCollection: true,
    cookieConsent: true
  });
  
  const [sessionSettings, setSessionSettings] = useState({
    autoLogout: true,
    logoutTime: 30, // minutes
    rememberDevice: true,
    deviceHistory: [
      { id: 1, device: 'Chrome on Windows', lastActive: '2023-06-15 14:30', location: 'New York, USA' },
      { id: 2, device: 'Safari on iPhone', lastActive: '2023-06-14 09:15', location: 'Boston, USA' }
    ]
  });

  // Handle password form change
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle session settings change
  const handleSessionChange = (field, value) => {
    setSessionSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    // In a real app, this would call an API to change the password
    console.log('Changing password:', passwordForm);
    
    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Show success message
    alert('Password changed successfully!');
  };
  
  // Handle two-factor toggle
  const handleTwoFactorToggle = (enabled) => {
    if (enabled) {
      // Show setup UI instead of immediately enabling
      setShowTwoFactorSetup(true);
    } else {
      // In a real app, this would call an API to disable 2FA
      setTwoFactorEnabled(false);
      setShowTwoFactorSetup(false);
      alert('Two-factor authentication disabled');
    }
  };
  
  // Handle two-factor setup completion
  const handleTwoFactorSetupComplete = () => {
    // In a real app, this would verify the setup
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    alert('Two-factor authentication enabled successfully!');
  };
  
  // Handle device removal
  const handleRemoveDevice = (deviceId) => {
    // In a real app, this would call an API to remove the device
    setSessionSettings(prev => ({
      ...prev,
      deviceHistory: prev.deviceHistory.filter(device => device.id !== deviceId)
    }));
    
    alert('Device removed from trusted devices');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="two-factor">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Sessions</TabsTrigger>
        </TabsList>
        
        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4 pt-4">
          <Card>
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Password Requirements</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 text-sm">
                      <li>At least 8 characters long</li>
                      <li>Include at least one uppercase letter</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Two-Factor Authentication Tab */}
        <TabsContent value="two-factor" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor-toggle" className="block">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code in addition to your password
                  </p>
                </div>
                <Switch 
                  id="two-factor-toggle"
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
              
              {showTwoFactorSetup && (
                <div className="mt-6 space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-medium">Setup Two-Factor Authentication</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {/* This would be a QR code in a real app */}
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center border">
                        <span className="text-sm text-gray-500">QR Code Placeholder</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Enter Verification Code</Label>
                      <Input
                        id="verification-code"
                        placeholder="Enter the 6-digit code"
                      />
                      <p className="text-sm text-muted-foreground">
                        Scan the QR code with your authenticator app and enter the verification code
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleTwoFactorSetupComplete}>
                        Verify and Enable
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {twoFactorEnabled && !showTwoFactorSetup && (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Two-Factor Authentication is Enabled</AlertTitle>
                  <AlertDescription>
                    Your account is protected with an additional layer of security.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2 mt-4">
                <h3 className="text-lg font-medium">Recovery Options</h3>
                <p className="text-sm text-muted-foreground">
                  If you lose access to your authentication app, you can use recovery codes to access your account.
                </p>
                <Button variant="outline" disabled={!twoFactorEnabled}>
                  View Recovery Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy & Sessions Tab */}
        <TabsContent value="privacy" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data settings
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activity-visible" className="block">Activity Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your activity status
                  </p>
                </div>
                <Switch 
                  id="activity-visible"
                  checked={privacySettings.activityVisible}
                  onCheckedChange={(checked) => handlePrivacyChange('activityVisible', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-searchable" className="block">Profile Searchability</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your profile to appear in search results
                  </p>
                </div>
                <Switch 
                  id="profile-searchable"
                  checked={privacySettings.profileSearchable}
                  onCheckedChange={(checked) => handlePrivacyChange('profileSearchable', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection" className="block">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow collection of usage data to improve services
                  </p>
                </div>
                <Switch 
                  id="data-collection"
                  checked={privacySettings.dataCollection}
                  onCheckedChange={(checked) => handlePrivacyChange('dataCollection', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cookie-consent" className="block">Cookie Consent</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow cookies for personalized experience
                  </p>
                </div>
                <Switch 
                  id="cookie-consent"
                  checked={privacySettings.cookieConsent}
                  onCheckedChange={(checked) => handlePrivacyChange('cookieConsent', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Manage your active sessions and devices
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-logout" className="block">Auto Logout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <Switch 
                  id="auto-logout"
                  checked={sessionSettings.autoLogout}
                  onCheckedChange={(checked) => handleSessionChange('autoLogout', checked)}
                />
              </div>
              
              {sessionSettings.autoLogout && (
                <div className="space-y-2">
                  <Label htmlFor="logout-time">Logout After (minutes)</Label>
                  <Input
                    id="logout-time"
                    type="number"
                    min="5"
                    max="240"
                    value={sessionSettings.logoutTime}
                    onChange={(e) => handleSessionChange('logoutTime', parseInt(e.target.value))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remember-device" className="block">Remember This Device</Label>
                  <p className="text-sm text-muted-foreground">
                    Stay logged in on this device
                  </p>
                </div>
                <Switch 
                  id="remember-device"
                  checked={sessionSettings.rememberDevice}
                  onCheckedChange={(checked) => handleSessionChange('rememberDevice', checked)}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <h3 className="text-base font-medium">Active Devices</h3>
                <div className="space-y-2">
                  {sessionSettings.deviceHistory.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Last active: {device.lastActive} • {device.location}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="destructive">
                  Log Out All Other Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
