import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Settings, Users, Shield, Server, BarChart2, FileText } from 'lucide-react';

const AdministrationPage = () => {
  const [, setActiveTab] = useState('users');

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-1">
          Manage system settings, users, and permissions
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none pb-0 mb-px">
          <TabsTrigger value="users" className="rounded-t-md rounded-b-none">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-t-md rounded-b-none">
            <Shield className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-t-md rounded-b-none">
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-t-md rounded-b-none">
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-t-md rounded-b-none">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <p className="text-sm text-center text-muted-foreground">
                  This is a mockup of the user management interface.
                </p>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="font-medium">John Doe</h3>
                    <p className="text-sm text-muted-foreground">Administrator</p>
                  </div>
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="font-medium">Jane Smith</h3>
                    <p className="text-sm text-muted-foreground">Manager</p>
                  </div>
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="font-medium">Bob Johnson</h3>
                    <p className="text-sm text-muted-foreground">Standard User</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Permission Settings
              </CardTitle>
              <CardDescription>
                Define and manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <p className="text-sm text-center text-muted-foreground">
                  This is a mockup of the permissions management interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <p className="text-sm text-center text-muted-foreground">
                  This is a mockup of the system configuration interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                System Logs
              </CardTitle>
              <CardDescription>
                View and analyze system logs and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <p className="text-sm text-center text-muted-foreground">
                  This is a mockup of the system logs interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                System Analytics
              </CardTitle>
              <CardDescription>
                View system usage statistics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <p className="text-sm text-center text-muted-foreground">
                  This is a mockup of the system analytics interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdministrationPage;
