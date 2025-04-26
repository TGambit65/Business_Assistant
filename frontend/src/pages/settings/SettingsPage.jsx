import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useEnhancedAuth } from '../../auth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Tag, Move, /* ArrowUp, ArrowDown, */ Mail, Calendar, Search, FileText,  // Removed unused ArrowUp, ArrowDown
  Tag as TagIcon, Settings, PenTool, BarChart3, Star, Flag, CheckCircle,
  AlertCircle, SortAsc, Users, UserCog, Shield, Key, Database, AlertTriangle,
  CheckSquare, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const [activeTab, setActiveTab] = useState('general');

  // Quick Actions state
  const [quickActions, setQuickActions] = useState([]);
  const [mailboxOrder, setMailboxOrder] = useState([]);
  const [labelOrder, setLabelOrder] = useState([]);

  // Admin state (keep usersLoading for potential future use)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Load stored Quick Actions order on component mount
  useEffect(() => {
    try {
      // Load saved quick actions
      const savedOrder = localStorage.getItem('quickAccessOrder'); // Keep savedOrder
      // const savedItems = localStorage.getItem('customQuickAccessItems'); // Removed unused savedItems

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

  // Load users data for admin tab
  useEffect(() => {
    // Only load users if admin tab is active and user has admin role
    if (activeTab === 'admin' && user?.role === 'admin') {
      loadUsers();
    }
  }, [activeTab, user?.role]);

  // Function to load users for admin panel
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      // In a real app, this would be an API call
      // Here we're generating mock data
      setTimeout(() => {
        const mockUsers = [
          {
            id: '1',
            email: 'john@example.com',
            name: 'John Doe',
            role: 'admin',
            status: 'active',
            lastLogin: '2023-06-01T10:30:00Z',
            permissions: ['read', 'write', 'admin'],
            tier: 'premium'
          },
          {
            id: '2',
            email: 'jane@example.com',
            name: 'Jane Smith',
            role: 'user',
            status: 'active',
            lastLogin: '2023-06-15T14:20:00Z',
            permissions: ['read', 'write'],
            tier: 'standard'
          },
          {
            id: '3',
            email: 'bob@example.com',
            name: 'Bob Johnson',
            role: 'user',
            status: 'inactive',
            lastLogin: '2023-05-20T09:45:00Z',
            permissions: ['read'],
            tier: 'free'
          },
          {
            id: '4',
            email: 'alice@example.com',
            name: 'Alice Brown',
            role: 'editor',
            status: 'active',
            lastLogin: '2023-06-18T11:15:00Z',
            permissions: ['read', 'write', 'export'],
            tier: 'premium'
          }
        ];

        setUsers(mockUsers);
        setUsersLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error loading users:", err);
      setUsersLoading(false);
    }
  };

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

  // Toggle user permission
  const toggleUserPermission = (userId, permission) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          const hasPermission = user.permissions.includes(permission);
          const newPermissions = hasPermission
            ? user.permissions.filter(p => p !== permission)
            : [...user.permissions, permission];

          return {
            ...user,
            permissions: newPermissions
          };
        }
        return user;
      })
    );
  };

  // Update user tier
  const updateUserTier = (userId, tier) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, tier } : user
      )
    );
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

  // Get formatted date from ISO string
  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Never';
    }
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
                  onClick={() => handleTabChange('notifications')}
                >
                  Notifications
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'security'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigate('/security-settings')}
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Security & Privacy</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'integrations'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabChange('integrations')}
                >
                  Integrations
                </button>
                <button
                  className={`px-4 py-2 text-left ${
                    activeTab === 'api'
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabChange('api')}
                >
                  <div className="flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    <span>API Settings</span>
                  </div>
                </button>
                {/* Only show admin option for users with admin role */}
                {user?.role === 'admin' && (
                  <button
                    className={`px-4 py-2 text-left ${
                      activeTab === 'admin'
                        ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleTabChange('admin')}
                  >
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>Admin</span>
                    </div>
                  </button>
                )}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Email</span>
                      <span>{user?.email || 'email@example.com'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Account Type</span>
                      <span className="capitalize">{user?.subscription?.plan || 'free'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 1, 2023'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" className="mr-2" onClick={() => navigate('/settings/profile')}>
                  Edit Profile
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'layout' && (
            <Card>
              <CardHeader>
                <CardTitle>Layout & Customization</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Quick Actions Order</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop to reorder your quick actions</p>

                  <DragDropContext onDragEnd={handleQuickActionDragEnd}>
                    <Droppable droppableId="quickActions">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mt-4"
                        >
                          {quickActions.map((action, index) => (
                            <Draggable key={action} draggableId={action} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center p-3 bg-card/50 border rounded-md"
                                >
                                  <div {...provided.dragHandleProps} className="mr-2 text-muted-foreground cursor-move">
                                    <Move size={18} />
                                  </div>
                                  <div className="mr-2">
                                    {availableIcons[action.replace(' ', '')] || <Mail size={20} />}
                                  </div>
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

                {/* Mailbox Order */}
                <div className="space-y-2 pt-6 border-t">
                  <h3 className="text-lg font-medium">Mailbox Order</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop to reorder your mailboxes</p>

                  <DragDropContext onDragEnd={handleMailboxDragEnd}>
                    <Droppable droppableId="mailboxes">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mt-4"
                        >
                          {mailboxOrder.map((mailbox, index) => (
                            <Draggable key={mailbox} draggableId={mailbox} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center p-3 bg-card/50 border rounded-md"
                                >
                                  <div {...provided.dragHandleProps} className="mr-2 text-muted-foreground cursor-move">
                                    <Move size={18} />
                                  </div>
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

                {/* Label Order */}
                <div className="space-y-2 pt-6 border-t">
                  <h3 className="text-lg font-medium">Label Order</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop to reorder your labels</p>

                  <DragDropContext onDragEnd={handleLabelDragEnd}>
                    <Droppable droppableId="labels">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mt-4"
                        >
                          {labelOrder.map((label, index) => (
                            <Draggable key={label} draggableId={label} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center p-3 bg-card/50 border rounded-md"
                                >
                                  <div {...provided.dragHandleProps} className="mr-2 text-muted-foreground cursor-move">
                                    <Move size={18} />
                                  </div>
                                  <Tag size={16} className="mr-2" />
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
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          )}

          {/* Admin Section */}
          {activeTab === 'admin' && user?.role === 'admin' && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, permissions, and access levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="py-4 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">User</th>
                            <th className="text-left py-3 px-2">Role</th>
                            <th className="text-left py-3 px-2">Status</th>
                            <th className="text-left py-3 px-2">Last Login</th>
                            <th className="text-left py-3 px-2">Permissions</th>
                            <th className="text-left py-3 px-2">Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <span className="capitalize px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-sm">
                                {formatDate(user.lastLogin)}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    className={`p-1 border rounded-md text-xs ${
                                      user.permissions.includes('read')
                                        ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                        : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                                    }`}
                                    onClick={() => toggleUserPermission(user.id, 'read')}
                                  >
                                    Read
                                  </button>
                                  <button
                                    className={`p-1 border rounded-md text-xs ${
                                      user.permissions.includes('write')
                                        ? 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                        : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                                    }`}
                                    onClick={() => toggleUserPermission(user.id, 'write')}
                                  >
                                    Write
                                  </button>
                                  <button
                                    className={`p-1 border rounded-md text-xs ${
                                      user.permissions.includes('admin')
                                        ? 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400'
                                        : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                                    }`}
                                    onClick={() => toggleUserPermission(user.id, 'admin')}
                                  >
                                    Admin
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <select
                                  value={user.tier}
                                  onChange={(e) => updateUserTier(user.id, e.target.value)}
                                  className="py-1 px-2 text-sm border rounded bg-background"
                                >
                                  <option value="free">Free</option>
                                  <option value="standard">Standard</option>
                                  <option value="premium">Premium</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={loadUsers} disabled={usersLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button>
                    <UserCog className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    <span>System Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure system-wide settings for all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Admin Access</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                            Changes made here affect all users. Make sure you understand the implications before saving.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md divide-y">
                      <div className="flex justify-between items-center p-4">
                        <div>
                          <h4 className="font-medium">Enable Multi-factor Authentication</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Require MFA for all administrative users
                          </p>
                        </div>
                        <button className="w-12 h-6 bg-primary rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <div>
                          <h4 className="font-medium">Maintenance Mode</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Put the application in maintenance mode (all users will be logged out)
                          </p>
                        </div>
                        <button className="w-12 h-6 bg-muted rounded-full relative">
                          <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <div>
                          <h4 className="font-medium">Enable API Access</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allow users to access the application via the API
                          </p>
                        </div>
                        <button className="w-12 h-6 bg-primary rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <div>
                          <h4 className="font-medium">Usage Analytics</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Collect anonymous usage data to improve the application
                          </p>
                        </div>
                        <button className="w-12 h-6 bg-primary rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Update System Settings
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="w-full h-24 bg-background border border-border mb-2 rounded"></div>
                      <div className="text-center">Light</div>
                    </div>
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="w-full h-24 bg-gray-900 border border-gray-700 mb-2 rounded"></div>
                      <div className="text-center">Dark</div>
                    </div>
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="w-full h-24 bg-amber-800 border border-amber-700 mb-2 rounded"></div>
                      <div className="text-center">Earth</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">Font Size</h3>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">A</span>
                    <input type="range" min="1" max="5" defaultValue="3" className="flex-1" />
                    <span className="text-lg ml-2">A</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" className="mr-2">Reset</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive email notifications about important updates</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h4 className="font-medium">New Mail Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new emails</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-background"></span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Manage connections to other services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mr-4">
                        G
                      </div>
                      <div>
                        <h4 className="font-medium">Google Calendar</h4>
                        <p className="text-sm text-muted-foreground">Sync your calendar events</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-700 rounded-md flex items-center justify-center text-white mr-4">
                        O
                      </div>
                      <div>
                        <h4 className="font-medium">Microsoft Outlook</h4>
                        <p className="text-sm text-muted-foreground">Import contacts and emails</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-400 rounded-md flex items-center justify-center text-white mr-4">
                        Z
                      </div>
                      <div>
                        <h4 className="font-medium">Zoom</h4>
                        <p className="text-sm text-muted-foreground">Schedule meetings from emails</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline">Manage All Integrations</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Manage API access and keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
                  <h3 className="font-medium">Your API Keys</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate and manage API keys for external integrations
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between p-4 border rounded-md mb-2">
                    <div>
                      <h4 className="font-medium">Primary API Key</h4>
                      <div className="flex items-center mt-1">
                        <div className="px-3 py-1 bg-muted text-muted-foreground rounded font-mono text-sm">
                          ••••••••••••••••••••••••
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          Show
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">Test API Key</h4>
                      <div className="flex items-center mt-1">
                        <div className="px-3 py-1 bg-muted text-muted-foreground rounded font-mono text-sm">
                          ••••••••••••••••••••••••
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          Show
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t mt-4">
                  <h3 className="font-medium mb-2">API Usage Limits</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Requests (75/100)</span>
                        <span className="text-sm">75%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Data Transfer (2.5/5 GB)</span>
                        <span className="text-sm">50%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" className="mr-2">Upgrade Plan</Button>
                <Button>Generate New Key</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}