import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

/**
 * NotificationSettings Component
 * 
 * Settings for email, push, and in-app notifications.
 */
const NotificationSettings = () => {
  // State for form values
  const [formValues, setFormValues] = useState({
    emailNotifications: {
      newMessages: true,
      mentions: true,
      updates: false,
      marketing: false,
      digest: 'weekly'
    },
    pushNotifications: {
      enabled: true,
      newMessages: true,
      mentions: true,
      updates: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      }
    },
    inAppNotifications: {
      enabled: true,
      showPreview: true,
      sound: true,
      desktop: true
    }
  });

  // Handle input change
  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle nested input change
  const handleNestedInputChange = (section, parent, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value
        }
      }
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log('Saving notification settings:', formValues);
    // Show success message
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="push">Push</TabsTrigger>
                <TabsTrigger value="in-app">In-App</TabsTrigger>
              </TabsList>
              
              {/* Email Notifications */}
              <TabsContent value="email" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-new-messages" className="block">New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when you get new messages
                      </p>
                    </div>
                    <Switch 
                      id="email-new-messages"
                      checked={formValues.emailNotifications.newMessages}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', 'newMessages', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-mentions" className="block">Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when you are mentioned
                      </p>
                    </div>
                    <Switch 
                      id="email-mentions"
                      checked={formValues.emailNotifications.mentions}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', 'mentions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-updates" className="block">Product Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about product updates and new features
                      </p>
                    </div>
                    <Switch 
                      id="email-updates"
                      checked={formValues.emailNotifications.updates}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', 'updates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-marketing" className="block">Marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive marketing emails and promotions
                      </p>
                    </div>
                    <Switch 
                      id="email-marketing"
                      checked={formValues.emailNotifications.marketing}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', 'marketing', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-digest">Email Digest</Label>
                    <Select 
                      value={formValues.emailNotifications.digest}
                      onValueChange={(value) => handleInputChange('emailNotifications', 'digest', value)}
                    >
                      <SelectTrigger id="email-digest">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Frequency of summary emails about your activity
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Push Notifications */}
              <TabsContent value="push" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-enabled" className="block">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications on your device
                    </p>
                  </div>
                  <Switch 
                    id="push-enabled"
                    checked={formValues.pushNotifications.enabled}
                    onCheckedChange={(checked) => handleInputChange('pushNotifications', 'enabled', checked)}
                  />
                </div>
                
                {formValues.pushNotifications.enabled && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-new-messages" className="block">New Messages</Label>
                        <p className="text-sm text-muted-foreground">
                          Push notifications for new messages
                        </p>
                      </div>
                      <Switch 
                        id="push-new-messages"
                        checked={formValues.pushNotifications.newMessages}
                        onCheckedChange={(checked) => handleInputChange('pushNotifications', 'newMessages', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-mentions" className="block">Mentions</Label>
                        <p className="text-sm text-muted-foreground">
                          Push notifications when you are mentioned
                        </p>
                      </div>
                      <Switch 
                        id="push-mentions"
                        checked={formValues.pushNotifications.mentions}
                        onCheckedChange={(checked) => handleInputChange('pushNotifications', 'mentions', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-updates" className="block">Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Push notifications for product updates
                        </p>
                      </div>
                      <Switch 
                        id="push-updates"
                        checked={formValues.pushNotifications.updates}
                        onCheckedChange={(checked) => handleInputChange('pushNotifications', 'updates', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="quiet-hours-enabled" className="block">Quiet Hours</Label>
                          <p className="text-sm text-muted-foreground">
                            Disable notifications during specific hours
                          </p>
                        </div>
                        <Switch 
                          id="quiet-hours-enabled"
                          checked={formValues.pushNotifications.quietHours.enabled}
                          onCheckedChange={(checked) => handleNestedInputChange('pushNotifications', 'quietHours', 'enabled', checked)}
                        />
                      </div>
                      
                      {formValues.pushNotifications.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor="quiet-hours-start">Start Time</Label>
                            <input
                              type="time"
                              id="quiet-hours-start"
                              value={formValues.pushNotifications.quietHours.start}
                              onChange={(e) => handleNestedInputChange('pushNotifications', 'quietHours', 'start', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quiet-hours-end">End Time</Label>
                            <input
                              type="time"
                              id="quiet-hours-end"
                              value={formValues.pushNotifications.quietHours.end}
                              onChange={(e) => handleNestedInputChange('pushNotifications', 'quietHours', 'end', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* In-App Notifications */}
              <TabsContent value="in-app" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="in-app-enabled" className="block">Enable In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications within the application
                    </p>
                  </div>
                  <Switch 
                    id="in-app-enabled"
                    checked={formValues.inAppNotifications.enabled}
                    onCheckedChange={(checked) => handleInputChange('inAppNotifications', 'enabled', checked)}
                  />
                </div>
                
                {formValues.inAppNotifications.enabled && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-preview" className="block">Show Preview</Label>
                        <p className="text-sm text-muted-foreground">
                          Show message preview in notifications
                        </p>
                      </div>
                      <Switch 
                        id="show-preview"
                        checked={formValues.inAppNotifications.showPreview}
                        onCheckedChange={(checked) => handleInputChange('inAppNotifications', 'showPreview', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notification-sound" className="block">Notification Sound</Label>
                        <p className="text-sm text-muted-foreground">
                          Play a sound when notifications arrive
                        </p>
                      </div>
                      <Switch 
                        id="notification-sound"
                        checked={formValues.inAppNotifications.sound}
                        onCheckedChange={(checked) => handleInputChange('inAppNotifications', 'sound', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="desktop-notifications" className="block">Desktop Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications on your desktop
                        </p>
                      </div>
                      <Switch 
                        id="desktop-notifications"
                        checked={formValues.inAppNotifications.desktop}
                        onCheckedChange={(checked) => handleInputChange('inAppNotifications', 'desktop', checked)}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button">Reset to Defaults</Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NotificationSettings;
