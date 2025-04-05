import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Settings, Key, Users, Shield, BarChart } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <Link
                to="/admin"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Overview
              </Link>
              <Link
                to="/admin/api-settings"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/api-settings') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Key className="h-4 w-4 mr-2" />
                API Settings
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/users') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Link>
              <Link
                to="/admin/settings"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/settings') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Link>
              <Link
                to="/admin/analytics"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive('/analytics') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </nav>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;