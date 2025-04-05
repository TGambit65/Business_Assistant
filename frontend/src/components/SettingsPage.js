"use client"

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Move,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
  Loader2,
} from 'lucide-react';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [tempKeywords, setTempKeywords] = useState('');
  const { theme, setTheme } = useTheme();

  // Dummy data/handlers for Email Boxes tab
  const boxes = [];
  const handleDragEnd = () => {};
  const startEditing = () => {};
  const saveEdits = () => {};
  const toggleImportant = () => {};
  const handleDeleteBox = () => {};
  const handleAddBox = () => { return { id: Date.now() }; };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your application settings.</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="email-boxes">Email Boxes</TabsTrigger>
          <TabsTrigger value="keyboard-shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage your basic account information.</p>
              <div>
                <Label htmlFor="general-name">Name:</Label>
                <Input id="general-name" defaultValue="John Doe" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="general-email">Email:</Label>
                <Input id="general-email" defaultValue="john@example.com" type="email" className="mt-1" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="general-notifications" defaultChecked />
                <Label htmlFor="general-notifications" className="font-normal">Enable notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-3">Select Theme</h3>
                <div className="flex flex-wrap gap-4">
                  {/* Light Theme Option */}
                  <div
                    className={`cursor-pointer border-2 ${theme === 'light' ? 'border-primary' : 'border-transparent'} rounded-md p-1 transition-all`}
                    title="Select Light Theme"
                    onClick={() => setTheme('light')}
                  >
                    <div className="w-24 h-16 bg-background border border-border rounded flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-foreground">Light</span>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Theme Option */}
                  <div
                    className={`cursor-pointer border-2 ${theme === 'dark' ? 'border-primary' : 'border-transparent'} hover:border-primary/50 rounded-md p-1 transition-all`}
                    title="Select Dark Theme"
                    onClick={() => setTheme('dark')}
                  >
                    <div className="w-24 h-16 bg-[#09090b] border border-neutral-800 rounded flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-neutral-50">Dark</span>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-3 h-3 rounded-full bg-[#fafafa]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27272a]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Custom Theme Section */}
              <div>
                <h3 className="text-base font-medium mb-3">Upload Custom Theme</h3>
                <Label htmlFor="theme-upload" className="text-sm text-muted-foreground mb-1">
                  Upload a theme file (e.g., .json):
                </Label>
                <Input type="file" id="theme-upload" accept=".json" className="text-sm"/>
                <p className="text-xs text-muted-foreground mt-1">
                  Theme files should define CSS variables according to documentation.
                </p>
              </div>

              {/* Create Theme Section */}
              <div>
                <h3 className="text-base font-medium mb-3">Create Theme</h3>
                <div className="p-4 border border-dashed border-border rounded-md bg-secondary/50">
                  <p className="text-sm text-muted-foreground">
                    <strong className="font-medium text-foreground">Coming Soon:</strong>
                    {' '}A powerful theme editor allowing you to customize colors, fonts, and styles directly within the application. Stay tuned for updates!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Boxes Tab */}
        <TabsContent value="email-boxes">
          <Card>
            <CardHeader>
              <CardTitle>Email Boxes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reorder, edit, delete, or star/unstar your custom email sorting boxes below.
              </p>
              <div className="border rounded-lg p-4 space-y-2 bg-background">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Email box management UI goes here. (Drag and drop list)
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus size={16} className="mr-2"/> Add Box
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyboard Shortcuts Tab */}
        <TabsContent value="keyboard-shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure keyboard shortcuts for common actions.</p>
              <div>
                <Label htmlFor="shortcut-new">Create New:</Label>
                <Input id="shortcut-new" placeholder="e.g., Ctrl+N" defaultValue="Ctrl+N" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="shortcut-save">Save:</Label>
                <Input id="shortcut-save" placeholder="e.g., Ctrl+S" defaultValue="Ctrl+S" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="shortcut-search">Search:</Label>
                <Input id="shortcut-search" placeholder="e.g., Ctrl+F" defaultValue="Ctrl+F" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage data collection and privacy options.</p>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="privacy-data" defaultChecked />
                <Label htmlFor="privacy-data" className="font-normal">
                  Allow anonymous usage data collection
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
