/**
 * BiometricCredentialsPage
 * 
 * This page allows users to manage their biometric credentials.
 * It includes the BiometricCredentials component and provides
 * page-level navigation and layout.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Info } from 'lucide-react';
import BiometricCredentials from '../../components/auth/BiometricCredentials';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../contexts/ToastContext';

const BiometricCredentialsPage: React.FC = () => {
  const { success, error } = useToast();

  const handleRegisterSuccess = () => {
    success("Biometric credential registered successfully!");
  };

  const handleRegisterError = (errorMessage: string) => {
    error(`Failed to register biometric credential: ${errorMessage}`);
  };

  const handleRemoveSuccess = () => {
    success("Biometric credential removed successfully!");
  };

  const handleRemoveError = (errorMessage: string) => {
    error(`Failed to remove biometric credential: ${errorMessage}`);
  };

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/security-settings" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
            <ArrowLeft size={16} className="mr-1" />
            Back to Security Settings
          </Link>
          <h1 className="text-2xl font-bold flex items-center mb-2">
            <Shield className="mr-2" /> Biometric Authentication
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your biometric credentials to enable passwordless sign-in.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Biometric Credentials</CardTitle>
                <CardDescription>
                  Register and manage your biometric authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BiometricCredentials 
                  onRegisterSuccess={handleRegisterSuccess}
                  onRegisterError={handleRegisterError}
                  onRemoveSuccess={handleRemoveSuccess}
                  onRemoveError={handleRemoveError}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info size={18} className="mr-2" /> About Biometric Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Biometric authentication allows you to sign in using your device's biometric features, such as:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                    <li>Fingerprint sensors</li>
                    <li>Facial recognition</li>
                    <li>Windows Hello</li>
                    <li>Touch ID on macOS</li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your biometric data never leaves your device. Instead, your device verifies your identity and securely communicates with our servers using public key cryptography.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>Register each device you use regularly</li>
                    <li>Remove credentials for devices you no longer use</li>
                    <li>Still keep a strong password as a backup</li>
                    <li>Enable 2FA for an additional layer of security</li>
                  </ul>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <Link to="/security-settings">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Security Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BiometricCredentialsPage;