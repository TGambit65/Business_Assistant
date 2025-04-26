import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';

/**
 * LayoutSettings Component
 * 
 * Settings for layout customization, sidebar, and workspace preferences.
 */
const LayoutSettings = () => {
  // State for form values
  const [formValues, setFormValues] = useState({
    layoutDensity: 'comfortable',
    sidebarPosition: 'left',
    sidebarCollapsed: false,
    showToolbar: true,
    toolbarPosition: 'top',
    contentWidth: 80, // percentage
    enableDragAndDrop: true
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
    console.log('Saving layout settings:', formValues);
    // Show success message
    alert('Layout settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Layout & Customization</CardTitle>
            <CardDescription>Customize the layout and workspace</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Layout Density */}
            <div className="space-y-2">
              <Label htmlFor="layout-density">Layout Density</Label>
              <RadioGroup 
                value={formValues.layoutDensity}
                onValueChange={(value) => handleInputChange('layoutDensity', value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="density-compact" />
                  <Label htmlFor="density-compact">Compact</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="density-comfortable" />
                  <Label htmlFor="density-comfortable">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="density-spacious" />
                  <Label htmlFor="density-spacious">Spacious</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground mt-1">
                Controls the spacing and density of UI elements
              </p>
            </div>
            
            {/* Sidebar Settings */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Sidebar Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Customize the sidebar appearance and behavior
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sidebar-position">Sidebar Position</Label>
                  <Select 
                    value={formValues.sidebarPosition}
                    onValueChange={(value) => handleInputChange('sidebarPosition', value)}
                  >
                    <SelectTrigger id="sidebar-position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sidebar-collapsed" className="block">Collapsed by Default</Label>
                    <p className="text-sm text-muted-foreground">
                      Start with the sidebar collapsed
                    </p>
                  </div>
                  <Switch 
                    id="sidebar-collapsed"
                    checked={formValues.sidebarCollapsed}
                    onCheckedChange={(checked) => handleInputChange('sidebarCollapsed', checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Toolbar Settings */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Toolbar Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Customize the toolbar appearance and behavior
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-toolbar" className="block">Show Toolbar</Label>
                    <p className="text-sm text-muted-foreground">
                      Display the toolbar with common actions
                    </p>
                  </div>
                  <Switch 
                    id="show-toolbar"
                    checked={formValues.showToolbar}
                    onCheckedChange={(checked) => handleInputChange('showToolbar', checked)}
                  />
                </div>
                
                {formValues.showToolbar && (
                  <div className="space-y-2">
                    <Label htmlFor="toolbar-position">Toolbar Position</Label>
                    <Select 
                      value={formValues.toolbarPosition}
                      onValueChange={(value) => handleInputChange('toolbarPosition', value)}
                    >
                      <SelectTrigger id="toolbar-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content-width">Content Width: {formValues.contentWidth}%</Label>
              </div>
              <Slider
                id="content-width"
                min={50}
                max={100}
                step={5}
                value={[formValues.contentWidth]}
                onValueChange={([value]) => handleInputChange('contentWidth', value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Adjust the maximum width of the content area
              </p>
            </div>
            
            {/* Drag and Drop */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="drag-drop" className="block">Enable Drag and Drop</Label>
                <p className="text-sm text-muted-foreground">
                  Allow rearranging elements via drag and drop
                </p>
              </div>
              <Switch 
                id="drag-drop"
                checked={formValues.enableDragAndDrop}
                onCheckedChange={(checked) => handleInputChange('enableDragAndDrop', checked)}
              />
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

export default LayoutSettings;
