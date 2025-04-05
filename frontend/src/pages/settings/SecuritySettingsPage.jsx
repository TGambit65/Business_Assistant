import React from 'react';
import { SecuritySettings } from '../../auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useEnhancedAuth } from '../../auth';
import { useToast } from '../../contexts/ToastContext';
import { Shield, Lock, Smartphone, Key } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useEnhancedAuth();
  const { success } = useToast();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Security Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Security Overview Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Overview
            </CardTitle>
            <CardDescription>
              Manage your account security settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Lock className="mr-2 h-5 w-5" />
                  <h3 className="font-semibold">Account Protection</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Secure your account with two-factor authentication and strong passwords.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Smartphone className="mr-2 h-5 w-5" />
                  <h3 className="font-semibold">Device Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage devices that are connected to your account.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Key className="mr-2 h-5 w-5" />
                  <h3 className="font-semibold">Password Settings</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Update your password and manage password requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings Component */}
        <div className="md:col-span-3">
          <SecuritySettings />
        </div>
      </div>
    </div>
  );
}
