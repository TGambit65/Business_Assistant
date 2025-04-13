import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Database, Shield, RefreshCw } from 'lucide-react';

/**
 * AdminSettings Component
 * 
 * Admin settings for user management, permissions, and system configuration.
 */
const AdminSettings = () => {
  // State for users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Function to load users
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
    <div className="space-y-6">
      <Card>
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
                                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            onClick={() => toggleUserPermission(user.id, 'read')}
                          >
                            Read
                          </button>
                          <button
                            className={`p-1 border rounded-md text-xs ${
                              user.permissions.includes('write')
                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            onClick={() => toggleUserPermission(user.id, 'write')}
                          >
                            Write
                          </button>
                          <button
                            className={`p-1 border rounded-md text-xs ${
                              user.permissions.includes('admin')
                                ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            onClick={() => toggleUserPermission(user.id, 'admin')}
                          >
                            Admin
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={user.tier}
                          onValueChange={(value) => updateUserTier(user.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={loadUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            <span>System Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Storage Usage</h3>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '65%' }}></div>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>65% used</span>
              <span>650GB / 1TB</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">API Rate Limits</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Standard Users</p>
                <p className="font-medium">100 requests/minute</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium Users</p>
                <p className="font-medium">500 requests/minute</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium">Security Settings</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span>Password Policy</span>
                <span className="text-sm">Strong</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Session Timeout</span>
                <span className="text-sm">30 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span>2FA Requirement</span>
                <span className="text-sm">Admin users only</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">
            <Shield className="mr-2 h-4 w-4" />
            Update Security Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettings;
