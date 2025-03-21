import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Tag, Move, ArrowUp, ArrowDown, Mail, Calendar, Search, FileText, Tag as TagIcon, Settings, PenTool, BarChart3, Star, Flag, CheckCircle, AlertCircle, SortAsc } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  
  // Quick Actions state
  const [quickActions, setQuickActions] = useState([]);
  const [mailboxOrder, setMailboxOrder] = useState([]);
  const [labelOrder, setLabelOrder] = useState([]);

  // Load stored Quick Actions order on component mount
  useEffect(() => {
    try {
      // Load saved quick actions
      const savedOrder = localStorage.getItem('quickAccessOrder');
      const savedItems = localStorage.getItem('customQuickAccessItems');
      
      if (savedOrder) {
        const orderItems = JSON.parse(savedOrder);
        setQuickActions(orderItems);
      } else {
        // Set some default quick actions if none are saved
        setQuickActions(['Compose Email', 'Search Inbox', 'Schedule']);
      }
      
      // Load saved mailbox order or set defaults
      const savedMailboxOrder = localStorage.getItem('mailboxOrder');
      if (savedMailboxOrder) {
        setMailboxOrder(JSON.parse(savedMailboxOrder));
      } else {
        setMailboxOrder(['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam']);
      }
      
      // Load saved label order or set defaults
      const savedLabelOrder = localStorage.getItem('labelOrder');
      if (savedLabelOrder) {
        setLabelOrder(JSON.parse(savedLabelOrder));
      } else {
        setLabelOrder(['Important', 'Work', 'Personal', 'Finance']);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }, []);

  const handleQuickActionDragEnd = (result) => {
    try {
      if (!result.destination) return;
      
      const items = Array.from(quickActions);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setQuickActions(items);
      localStorage.setItem('quickAccessOrder', JSON.stringify(items));
      
      // No toast notifications - just log to console
      console.log('Quick action order updated');
    } catch (err) {
      console.error("Error in quick action drag end:", err);
    }
  };
  
  const handleMailboxDragEnd = (result) => {
    try {
      if (!result.destination) return;
      
      const items = Array.from(mailboxOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setMailboxOrder(items);
      localStorage.setItem('mailboxOrder', JSON.stringify(items));
      
      // No toast notifications - just log to console
      console.log('Mailbox order updated');
    } catch (err) {
      console.error("Error in mailbox drag end:", err);
    }
  };
  
  const handleLabelDragEnd = (result) => {
    try {
      if (!result.destination) return;
      
      const items = Array.from(labelOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setLabelOrder(items);
      localStorage.setItem('labelOrder', JSON.stringify(items));
      
      // No toast notifications - just log to console
      console.log('Label order updated');
    } catch (err) {
      console.error("Error in label drag end:", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Available icons for quick actions (for display only in settings)
  const availableIcons = {
    Mail: <Mail size={20} />,
    Calendar: <Calendar size={20} />,
    Search: <Search size={20} />,
    FileText: <FileText size={20} />,
    Tag: <TagIcon size={20} />,
    PenTool: <PenTool size={20} />,
    Settings: <Settings size={20} />,
    BarChart3: <BarChart3 size={20} />,
    Star: <Star size={20} />,
    Flag: <Flag size={20} />,
    CheckCircle: <CheckCircle size={20} />,
    AlertCircle: <AlertCircle size={20} />,
    SortAsc: <SortAsc size={20} />
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'general'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabChange('general')}
                >
                  General
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'appearance'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabChange('appearance')}
                >
                  Appearance
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'layout'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabChange('layout')}
                >
                  Layout & Customization
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'notifications'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/settings/notifications')}
                >
                  Notifications
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'security'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/settings/security')}
                >
                  Security
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'integrations'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/settings/integrations')}
                >
                  Integrations
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'profile'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/settings/profile')}
                >
                  Profile
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'help'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/settings/help')}
                >
                  Help & Support
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'appearance' && 'Appearance Settings'}
                {activeTab === 'layout' && 'Layout & Customization'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'general' && 'Manage your basic settings'}
                {activeTab === 'appearance' && 'Customize the look and feel'}
                {activeTab === 'layout' && 'Arrange quick actions, mailboxes and labels'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || 'user@example.com'}
                      readOnly
                      className="w-full p-2 border border-input rounded-md bg-background/50"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Your primary email address</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Language</label>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Time Zone</label>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option>Eastern Time (US & Canada) UTC-05:00</option>
                      <option>Central Time (US & Canada) UTC-06:00</option>
                      <option>Pacific Time (US & Canada) UTC-08:00</option>
                      <option>UTC+00:00</option>
                    </select>
                  </div>
                </div>
              )}
              
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="light" name="theme" value="light" defaultChecked />
                        <label htmlFor="light">Light</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="dark" name="theme" value="dark" />
                        <label htmlFor="dark">Dark</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="system" name="theme" value="system" />
                        <label htmlFor="system">System</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Compact View</label>
                      <p className="text-sm text-muted-foreground">Show more content with less spacing</p>
                    </div>
                    <div>
                      <input type="checkbox" id="compact" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">High Contrast</label>
                      <p className="text-sm text-muted-foreground">Increase contrast for better readability</p>
                    </div>
                    <div>
                      <input type="checkbox" id="contrast" />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'layout' && (
                <div className="space-y-8">
                  {/* Quick Actions Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Quick Actions Order</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop to change the order of quick actions in your Command Center
                    </p>
                    
                    <DragDropContext onDragEnd={handleQuickActionDragEnd}>
                      <Droppable droppableId="quickActions">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 mb-6"
                          >
                            {quickActions.map((action, index) => (
                              <Draggable key={action} draggableId={action} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center p-3 bg-white dark:bg-gray-800 border rounded-md"
                                  >
                                    <span className="mr-2 text-gray-400">
                                      <Move size={18} />
                                    </span>
                                    <span className="mr-3">
                                      {availableIcons[action.split(' ').join('')] || <Mail size={18} />}
                                    </span>
                                    <span>{action}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                  
                  {/* Mailbox Order Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Mailbox Order</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop to change the order of mailboxes in your inbox view
                    </p>
                    
                    <DragDropContext onDragEnd={handleMailboxDragEnd}>
                      <Droppable droppableId="mailboxes">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 mb-6"
                          >
                            {mailboxOrder.map((mailbox, index) => (
                              <Draggable key={mailbox} draggableId={mailbox} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center p-3 bg-white dark:bg-gray-800 border rounded-md"
                                  >
                                    <span className="mr-2 text-gray-400">
                                      <Move size={18} />
                                    </span>
                                    <span>{mailbox}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                  
                  {/* Label Order Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Label Order</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop to change the order of labels in your inbox view
                    </p>
                    
                    <DragDropContext onDragEnd={handleLabelDragEnd}>
                      <Droppable droppableId="labels">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {labelOrder.map((label, index) => (
                              <Draggable key={label} draggableId={label} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center p-3 bg-white dark:bg-gray-800 border rounded-md"
                                  >
                                    <span className="mr-2 text-gray-400">
                                      <Move size={18} />
                                    </span>
                                    <span className="mr-3">
                                      <Tag size={18} />
                                    </span>
                                    <span>{label}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/email/rules')}
                        className="flex items-center gap-2"
                      >
                        <Tag size={16} />
                        <span>Manage Labels</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={() => console.log('Settings saved')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 