import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Moon, Sun, Monitor } from 'lucide-react';

/**
 * AppearanceSettings Component
 * 
 * Settings for theme, color scheme, font size, and other visual preferences.
 */
const AppearanceSettings = () => {
  // State for form values
  const [formValues, setFormValues] = useState({
    theme: 'system',
    colorScheme: 'blue',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  });

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log('Saving appearance settings:', formValues);
    // Show success message
    alert('Appearance settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Appearance Settings</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme
                </p>
              </div>
              
              <RadioGroup 
                value={formValues.theme}
                onValueChange={(value) => handleInputChange('theme', value)}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="system"
                    id="theme-system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Color Scheme */}
            <div className="space-y-2">
              <Label htmlFor="color-scheme">Color Scheme</Label>
              <Select 
                value={formValues.colorScheme}
                onValueChange={(value) => handleInputChange('colorScheme', value)}
              >
                <SelectTrigger id="color-scheme">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                The primary color used throughout the application
              </p>
            </div>
            
            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select 
                value={formValues.fontSize}
                onValueChange={(value) => handleInputChange('fontSize', value)}
              >
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="x-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the size of text throughout the application
              </p>
            </div>
            
            {/* Accessibility */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Accessibility</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust settings to improve accessibility
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduced-motion" className="block">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce the amount of animation and motion effects
                    </p>
                  </div>
                  <Switch 
                    id="reduced-motion"
                    checked={formValues.reducedMotion}
                    onCheckedChange={(checked) => handleInputChange('reducedMotion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast" className="block">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better readability
                    </p>
                  </div>
                  <Switch 
                    id="high-contrast"
                    checked={formValues.highContrast}
                    onCheckedChange={(checked) => handleInputChange('highContrast', checked)}
                  />
                </div>
              </div>
            </div>
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

export default AppearanceSettings;
