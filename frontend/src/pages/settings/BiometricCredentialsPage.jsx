import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Uncomment when needed
import { useTranslation } from 'react-i18next';
import {
  Fingerprint,
  Shield,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Info
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../contexts/ToastContext';
// import { useEnhancedAuth } from '../../auth'; // Uncomment when connecting to real auth service
import webAuthnService from '../../services/WebAuthnService';
import { analyticsService, AuthEvent } from '../../services/AnalyticsService';

// Mock data for credentials
// In a real application, this would come from the WebAuthnService
const generateMockCredentials = () => [
  {
    id: 'cred-1',
    name: 'MacBook Pro Touch ID',
    type: 'fingerprint',
    device: 'laptop',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cred-2',
    name: 'iPhone Face ID',
    type: 'face',
    device: 'smartphone',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cred-3',
    name: 'Windows Hello',
    type: 'fingerprint',
    device: 'desktop',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const BiometricCredentialsPage = () => {
  const { t } = useTranslation('biometric');
  // const navigate = useNavigate(); // Uncomment when needed for navigation
  const { success, error, info } = useToast();
  // const { user, verifyPassword } = useEnhancedAuth(); // Uncomment when connecting to real auth service

  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newCredentialName, setNewCredentialName] = useState('');
  const [verificationPassword, setVerificationPassword] = useState('');
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [editingCredential, setEditingCredential] = useState(null);
  const [editName, setEditName] = useState('');

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const available = await webAuthnService.isBiometricAvailable();
        setBiometricAvailable(available);
      } catch (err) {
        console.error('Error checking biometric availability:', err);
        setBiometricAvailable(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  // Load credentials from the service
  const loadCredentials = async () => {
    setIsLoading(true);

    try {
      // In a real application, this would call the WebAuthnService
      // const credentials = await webAuthnService.getCredentials();
      // setCredentials(credentials);

      // For now, just use mock data
      setTimeout(() => {
        setCredentials(generateMockCredentials());
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error loading credentials:', err);
      error(t('errors.load_failed'));
      setIsLoading(false);
    }
  };

  // Load credentials on component mount
  useEffect(() => {
    loadCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Handle adding a new credential
  const handleAddCredential = async () => {
    if (!newCredentialName.trim()) {
      error(t('errors.name_required'));
      return;
    }

    setIsLoading(true);

    try {
      // In a real application, this would call the WebAuthnService
      // const result = await webAuthnService.registerCredential(user.id, user.email);
      // if (result) {
      //   success(t('success.credential_added'));
      //   loadCredentials();
      // } else {
      //   error(t('errors.registration_failed'));
      // }

      // For now, just simulate success
      setTimeout(() => {
        const newCred = {
          id: `cred-${Date.now()}`,
          name: newCredentialName,
          type: 'fingerprint',
          device: 'unknown',
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        };

        setCredentials([...credentials, newCred]);
        setNewCredentialName('');
        setShowAddDialog(false);
        success(t('success.credential_added'));

        // Track the event
        analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_SETUP_SUCCESS);

        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error registering credential:', err);
      error(t('errors.registration_failed'));

      // Track the failure
      analyticsService.trackAuthEvent(AuthEvent.BIOMETRIC_SETUP_FAILURE, {
        errorMessage: err.message
      });

      setIsLoading(false);
    }
  };

  // Handle deleting a credential
  const handleDeleteCredential = async () => {
    if (!selectedCredential) return;

    setIsLoading(true);

    try {
      // In a real application, this would call the WebAuthnService
      // const result = await webAuthnService.removeCredential(selectedCredential.id);
      // if (result) {
      //   success(t('success.credential_removed'));
      //   loadCredentials();
      // } else {
      //   error(t('errors.removal_failed'));
      // }

      // For now, just simulate success
      setTimeout(() => {
        setCredentials(credentials.filter(cred => cred.id !== selectedCredential.id));
        setSelectedCredential(null);
        setShowDeleteDialog(false);
        success(t('success.credential_removed'));
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error removing credential:', err);
      error(t('errors.removal_failed'));
      setIsLoading(false);
    }
  };

  // Handle editing a credential
  const handleEditCredential = (credential) => {
    setEditingCredential(credential);
    setEditName(credential.name);
  };

  // Save edited credential
  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      error(t('errors.name_required'));
      return;
    }

    setCredentials(
      credentials.map(cred =>
        cred.id === id ? { ...cred, name: editName } : cred
      )
    );

    setEditingCredential(null);
    success(t('success.credential_updated'));
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCredential(null);
  };

  // Verify password before sensitive operations
  const handleVerifyPassword = async () => {
    if (!verificationPassword) {
      error(t('errors.password_required'));
      return;
    }

    setIsLoading(true);

    try {
      // In a real application, this would call the auth service
      // const result = await verifyPassword(verificationPassword);
      // if (result) {
      //   setShowVerifyDialog(false);
      //   setShowAddDialog(true);
      // } else {
      //   error(t('errors.password_incorrect'));
      // }

      // For now, just simulate success
      setTimeout(() => {
        setShowVerifyDialog(false);
        setShowAddDialog(true);
        setVerificationPassword('');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error verifying password:', err);
      error(t('errors.password_incorrect'));
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get device icon
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'smartphone':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      case 'laptop':
        return <Laptop className="h-5 w-5" />;
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Fingerprint className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Button
          onClick={() => biometricAvailable ? setShowVerifyDialog(true) : info(t('errors.not_available'))}
          disabled={isLoading || !biometricAvailable}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('add_credential')}
        </Button>
      </div>

      {!biometricAvailable && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('not_available_title')}</AlertTitle>
          <AlertDescription>
            {t('not_available_description')}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('credentials_title')}</CardTitle>
          <CardDescription>{t('credentials_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8">
              <Fingerprint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('no_credentials')}</p>
              <Button
                variant="outline"
                onClick={() => biometricAvailable ? setShowVerifyDialog(true) : info(t('errors.not_available'))}
                disabled={!biometricAvailable}
                className="mt-4"
              >
                {t('add_first_credential')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.map((credential) => (
                <div key={credential.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {getDeviceIcon(credential.device)}
                    </div>

                    {editingCredential?.id === credential.id ? (
                      <div className="flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mb-2"
                          placeholder={t('credential_name_placeholder')}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(credential.id)}
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            {t('save')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{credential.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('added_on')} {formatDate(credential.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>

                  {editingCredential?.id !== credential.id && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="text-sm text-muted-foreground mr-2">
                        {t('last_used')} {formatDate(credential.lastUsed)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCredential(credential)}
                        className="h-8 w-8 p-0"
                        title={t('edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCredential(credential);
                          setShowDeleteDialog(true);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title={t('remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col text-sm text-muted-foreground">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 mt-0.5" />
            <p>{t('security_note')}</p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5" />
            <p>{t('privacy_note')}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Verify Password Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('verify_title')}</DialogTitle>
            <DialogDescription>{t('verify_description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={verificationPassword}
                onChange={(e) => setVerificationPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleVerifyPassword}
              disabled={isLoading}
            >
              {isLoading ? t('verifying') : t('verify')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credential Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('add_title')}</DialogTitle>
            <DialogDescription>{t('add_description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credential-name">{t('credential_name')}</Label>
              <Input
                id="credential-name"
                value={newCredentialName}
                onChange={(e) => setNewCredentialName(e.target.value)}
                placeholder={t('credential_name_placeholder')}
              />
              <p className="text-sm text-muted-foreground">
                {t('credential_name_help')}
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">{t('instructions_title')}</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>{t('instructions.step1')}</li>
                <li>{t('instructions.step2')}</li>
                <li>{t('instructions.step3')}</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleAddCredential}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  {t('registering')}
                </>
              ) : (
                t('register')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Credential Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('remove_title')}</DialogTitle>
            <DialogDescription>
              {t('remove_description', { name: selectedCredential?.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>
                {t('remove_warning')}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCredential}
              disabled={isLoading}
            >
              {isLoading ? t('removing') : t('remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BiometricCredentialsPage;
