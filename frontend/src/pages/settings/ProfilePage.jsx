import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Save, Camera, X, RefreshCw, Smartphone, Info } from 'lucide-react';
import InstallPwaButton from '../../components/ui/InstallPwaButton';
import PwaInfo from '../../components/ui/PwaInfo';

/**
 * User Profile Page for editing personal information
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { success, error, info } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    language: 'en',
    timezone: 'America/New_York',
    avatar: '',
    emailSignature: ''
  });
  
  // Timezones list
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-05:00)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-06:00)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-07:00)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-08:00)' },
    { value: 'America/Anchorage', label: 'Alaska (UTC-09:00)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (UTC-10:00)' },
    { value: 'Europe/London', label: 'London (UTC+00:00)' },
    { value: 'Europe/Paris', label: 'Paris (UTC+01:00)' },
    { value: 'Europe/Helsinki', label: 'Helsinki (UTC+02:00)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+09:00)' },
    { value: 'Australia/Sydney', label: 'Sydney (UTC+10:00)' },
  ];
  
  // Languages list
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
  ];

  // Load user profile data
  useEffect(() => {
    if (user && user.profile) {
      setProfileData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        displayName: user.profile.displayName || '',
        email: user.email || '',
        language: user.profile.language || 'en',
        timezone: user.profile.timezone || 'America/New_York',
        avatar: user.profile.avatar || '',
        emailSignature: user.preferences?.emailSignature || ''
      });
    }
  }, [user]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Auto-generate display name from first and last name
  useEffect(() => {
    if (profileData.firstName && profileData.lastName && !profileData.displayName) {
      setProfileData(prev => ({
        ...prev,
        displayName: `${prev.firstName} ${prev.lastName}`
      }));
    }
  }, [profileData.firstName, profileData.lastName, profileData.displayName]); // Added profileData.displayName
  
  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      error('Please select an image file');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      error('File size cannot exceed 2MB');
      return;
    }
    
    setUploadingAvatar(true);
    info('Uploading avatar...');
    
    // Simulate upload - in a real app, this would upload to a server
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        setProfileData(prev => ({
          ...prev,
          avatar: event.target.result
        }));
        setUploadingAvatar(false);
        success('Avatar uploaded successfully');
      }, 1500);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove avatar
  const removeAvatar = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: ''
    }));
  };
  
  // Save profile
  const saveProfile = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!profileData.firstName || !profileData.lastName) {
        error('First name and last name are required');
        setLoading(false);
        return;
      }
      
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user profile in AuthContext
      if (updateUserProfile) {
        updateUserProfile({
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            displayName: profileData.displayName,
            language: profileData.language,
            timezone: profileData.timezone,
            avatar: profileData.avatar
          },
          preferences: {
            emailSignature: profileData.emailSignature
          }
        });
      }
      
      success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Update your personal information and preferences
      </p>
      
      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.displayName || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a profile picture to personalize your account
                </p>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      disabled={uploadingAvatar}
                    />
                    <Button variant="outline" disabled={uploadingAvatar}>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Picture
                    </Button>
                  </div>
                  {profileData.avatar && (
                    <Button variant="outline" onClick={removeAvatar} disabled={uploadingAvatar}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium block">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium block">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            
            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium block">
                Display Name
              </label>
              <Input
                id="displayName"
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
                placeholder="Enter your display name"
              />
              <p className="text-xs text-muted-foreground">
                This name will be displayed to other users
              </p>
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                type="email"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language and Timezone */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="language" className="text-sm font-medium block">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={profileData.language}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {languages.map(language => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium block">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {timezones.map(timezone => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Email Signature */}
            <div className="space-y-2">
              <label htmlFor="emailSignature" className="text-sm font-medium block">
                Email Signature
              </label>
              <textarea
                id="emailSignature"
                name="emailSignature"
                value={profileData.emailSignature}
                onChange={handleInputChange}
                placeholder="Enter your email signature"
                className="w-full p-2 min-h-[100px] border rounded-md bg-background"
              />
              <p className="text-xs text-muted-foreground">
                This signature will be appended to your outgoing emails
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" className="mr-2" onClick={() => navigate('/settings')}>
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Enhanced PWA Installation and Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              <span>Mobile App</span>
            </CardTitle>
            <CardDescription>Install and manage Email Assistant as a mobile app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p>Install Email Assistant on your device for a faster, app-like experience with offline capabilities.</p>
              <div className="flex items-center mb-4">
                <InstallPwaButton variant="primary" />
                {/* Fallback for browsers that don't support PWA installation */}
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  Or open this website in Chrome or Safari on your mobile device and select "Add to Home Screen".
                </div>
              </div>
              
              {/* PWA Features List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  PWA Features
                </h4>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Works offline and with poor connection</li>
                  <li>Faster loading times after first visit</li>
                  <li>Push notifications (when enabled)</li>
                  <li>Access directly from your home screen</li>
                  <li>Automatic updates</li>
                </ul>
              </div>
              
              {/* PWA Status Information */}
              <PwaInfo />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 