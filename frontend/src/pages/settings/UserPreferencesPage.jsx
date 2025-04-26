import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Eye,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/NewThemeContext';
import { userPreferencesService } from '../../services/UserPreferencesService';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, changeLanguage } from '../../i18n';
import { applyAccessibilityPreferences } from '../../utils/accessibility';

const UserPreferencesPage = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { setTheme } = useTheme();

  // Load user preferences
  const [preferences, setPreferences] = useState(userPreferencesService.getPreferences());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Subscribe to preference changes
  useEffect(() => {
    const unsubscribe = userPreferencesService.subscribe((newPrefs) => {
      setPreferences(newPrefs);
    });

    return () => unsubscribe();
  }, []);

  // Handle language change
  const handleLanguageChange = (language) => {
    setIsLoading(true);

    try {
      // Update language in i18n
      changeLanguage(language);

      // Update user preferences
      userPreferencesService.setLanguage(language);

      success(t('preferences.language_changed'));
    } catch (err) {
      console.error('Error changing language:', err);
      error(t('preferences.language_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme change
  const handleThemeChange = (theme) => {
    setIsLoading(true);

    try {
      // Update theme
      setTheme(theme);

      // Update user preferences
      userPreferencesService.setTheme(theme);

      success(t('preferences.theme_changed'));
    } catch (err) {
      console.error('Error changing theme:', err);
      error(t('preferences.theme_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle accessibility preference change
  const handleAccessibilityChange = (key, value) => {
    setIsLoading(true);

    try {
      // Update accessibility preferences
      const newAccessibility = {
        ...preferences.accessibility,
        [key]: value,
      };

      userPreferencesService.setAccessibility(newAccessibility);
      applyAccessibilityPreferences(newAccessibility);

      success(t('preferences.accessibility_changed'));
    } catch (err) {
      console.error('Error changing accessibility settings:', err);
      error(t('preferences.accessibility_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification preference change
  const handleNotificationChange = (key, value) => {
    setIsLoading(true);

    try {
      // Update notification preferences
      userPreferencesService.setNotifications({
        [key]: value,
      });

      success(t('preferences.notifications_changed'));
    } catch (err) {
      console.error('Error changing notification settings:', err);
      error(t('preferences.notifications_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle security preference change
  const handleSecurityChange = (key, value) => {
    setIsLoading(true);

    try {
      // Update security preferences
      userPreferencesService.setSecurity({
        [key]: value,
      });

      success(t('preferences.security_changed'));
    } catch (err) {
      console.error('Error changing security settings:', err);
      error(t('preferences.security_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle display preference change
  const handleDisplayChange = (key, value) => {
    setIsLoading(true);

    try {
      // Update display preferences
      userPreferencesService.setDisplay({
        [key]: value,
      });

      success(t('preferences.display_changed'));
    } catch (err) {
      console.error('Error changing display settings:', err);
      error(t('preferences.display_change_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset preferences
  const handleResetPreferences = () => {
    if (window.confirm(t('preferences.confirm_reset'))) {
      setIsLoading(true);

      try {
        userPreferencesService.resetPreferences();
        success(t('preferences.reset_success'));
      } catch (err) {
        console.error('Error resetting preferences:', err);
        error(t('preferences.reset_error'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle export preferences
  const handleExportPreferences = () => {
    try {
      const jsonString = userPreferencesService.exportPreferences();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-preferences-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success(t('preferences.export_success'));
    } catch (err) {
      console.error('Error exporting preferences:', err);
      error(t('preferences.export_error'));
    }
  };

  // Handle import preferences
  const handleImportPreferences = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target.result;
        const success = userPreferencesService.importPreferences(jsonString);

        if (success) {
          success(t('preferences.import_success'));
        } else {
          error(t('preferences.import_error'));
        }
      } catch (err) {
        console.error('Error importing preferences:', err);
        error(t('preferences.import_error'));
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('preferences.title')}</h1>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {t('preferences.close')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('preferences.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t('preferences.tabs.appearance')}
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            {t('preferences.tabs.accessibility')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('preferences.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('preferences.tabs.security')}
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.language.title')}</CardTitle>
                <CardDescription>{t('preferences.language.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">{t('preferences.language.select')}</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={handleLanguageChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="language" className="w-[180px]">
                        <SelectValue placeholder={t('preferences.language.select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {t(`preferences.language.options.${lang}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('preferences.language.rtl_support')}</Label>
                    <div className="text-sm text-muted-foreground">
                      {RTL_LANGUAGES.includes(preferences.language) ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          {t('preferences.enabled')}
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          {t('preferences.disabled')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.data.title')}</CardTitle>
                <CardDescription>{t('preferences.data.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportPreferences}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Download className="h-4 w-4" />
                    {t('preferences.data.export')}
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('import-file').click()}
                      className="flex items-center gap-2 w-full"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                      {t('preferences.data.import')}
                    </Button>
                    <input
                      type="file"
                      id="import-file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportPreferences}
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleResetPreferences}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('preferences.data.reset')}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {t('preferences.data.last_updated')}: {new Date(preferences.lastUpdated).toLocaleString()}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.theme.title')}</CardTitle>
                <CardDescription>{t('preferences.theme.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">{t('preferences.theme.select')}</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={handleThemeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="theme" className="w-[180px]">
                        <SelectValue placeholder={t('preferences.theme.select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            {t('preferences.theme.options.light')}
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            {t('preferences.theme.options.dark')}
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            {t('preferences.theme.options.system')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.display.title')}</CardTitle>
                <CardDescription>{t('preferences.display.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="density">{t('preferences.display.density')}</Label>
                    <Select
                      value={preferences.display.density}
                      onValueChange={(value) => handleDisplayChange('density', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="density" className="w-[180px]">
                        <SelectValue placeholder={t('preferences.display.density_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">{t('preferences.display.density_options.compact')}</SelectItem>
                        <SelectItem value="comfortable">{t('preferences.display.density_options.comfortable')}</SelectItem>
                        <SelectItem value="spacious">{t('preferences.display.density_options.spacious')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="fontSize">{t('preferences.display.font_size')}</Label>
                    <Select
                      value={preferences.display.fontSize}
                      onValueChange={(value) => handleDisplayChange('fontSize', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="fontSize" className="w-[180px]">
                        <SelectValue placeholder={t('preferences.display.font_size_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t('preferences.display.font_size_options.small')}</SelectItem>
                        <SelectItem value="medium">{t('preferences.display.font_size_options.medium')}</SelectItem>
                        <SelectItem value="large">{t('preferences.display.font_size_options.large')}</SelectItem>
                        <SelectItem value="x-large">{t('preferences.display.font_size_options.x_large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">{t('preferences.display.animations')}</Label>
                    <Switch
                      id="animations"
                      checked={preferences.display.animations}
                      onCheckedChange={(checked) => handleDisplayChange('animations', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.accessibility.title')}</CardTitle>
                <CardDescription>{t('preferences.accessibility.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reducedMotion">{t('preferences.accessibility.reduced_motion')}</Label>
                    <Switch
                      id="reducedMotion"
                      checked={preferences.accessibility.reducedMotion}
                      onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="highContrast">{t('preferences.accessibility.high_contrast')}</Label>
                    <Switch
                      id="highContrast"
                      checked={preferences.accessibility.highContrast}
                      onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="screenReaderHints">{t('preferences.accessibility.screen_reader_hints')}</Label>
                    <Switch
                      id="screenReaderHints"
                      checked={preferences.accessibility.screenReaderHints}
                      onCheckedChange={(checked) => handleAccessibilityChange('screenReaderHints', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboardNavigation">{t('preferences.accessibility.keyboard_navigation')}</Label>
                    <Switch
                      id="keyboardNavigation"
                      checked={preferences.accessibility.keyboardNavigation}
                      onCheckedChange={(checked) => handleAccessibilityChange('keyboardNavigation', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.accessibility.text_options')}</CardTitle>
                <CardDescription>{t('preferences.accessibility.text_options_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fontSize" className="mb-2 block">
                      {t('preferences.accessibility.font_size')}
                    </Label>
                    <Select
                      value={preferences.accessibility.fontSize}
                      onValueChange={(value) => handleAccessibilityChange('fontSize', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder={t('preferences.accessibility.font_size_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t('preferences.accessibility.font_size_options.small')}</SelectItem>
                        <SelectItem value="medium">{t('preferences.accessibility.font_size_options.medium')}</SelectItem>
                        <SelectItem value="large">{t('preferences.accessibility.font_size_options.large')}</SelectItem>
                        <SelectItem value="x-large">{t('preferences.accessibility.font_size_options.x_large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lineSpacing" className="mb-2 block">
                      {t('preferences.accessibility.line_spacing')}
                    </Label>
                    <Select
                      value={preferences.accessibility.lineSpacing}
                      onValueChange={(value) => handleAccessibilityChange('lineSpacing', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="lineSpacing">
                        <SelectValue placeholder={t('preferences.accessibility.line_spacing_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">{t('preferences.accessibility.line_spacing_options.normal')}</SelectItem>
                        <SelectItem value="wide">{t('preferences.accessibility.line_spacing_options.wide')}</SelectItem>
                        <SelectItem value="wider">{t('preferences.accessibility.line_spacing_options.wider')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('preferences.notifications.title')}</CardTitle>
              <CardDescription>{t('preferences.notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">{t('preferences.notifications.email')}</Label>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">{t('preferences.notifications.push')}</Label>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="inAppNotifications">{t('preferences.notifications.in_app')}</Label>
                  <Switch
                    id="inAppNotifications"
                    checked={preferences.notifications.inApp}
                    onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="marketingNotifications">{t('preferences.notifications.marketing')}</Label>
                  <Switch
                    id="marketingNotifications"
                    checked={preferences.notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="securityAlerts">{t('preferences.notifications.security_alerts')}</Label>
                  <Switch
                    id="securityAlerts"
                    checked={preferences.notifications.securityAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('securityAlerts', checked)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.security.title')}</CardTitle>
                <CardDescription>{t('preferences.security.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mfaEnabled">{t('preferences.security.mfa')}</Label>
                    <Switch
                      id="mfaEnabled"
                      checked={preferences.security.mfaEnabled}
                      onCheckedChange={(checked) => handleSecurityChange('mfaEnabled', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="biometricEnabled">{t('preferences.security.biometric')}</Label>
                    <Switch
                      id="biometricEnabled"
                      checked={preferences.security.biometricEnabled}
                      onCheckedChange={(checked) => handleSecurityChange('biometricEnabled', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginNotifications">{t('preferences.security.login_notifications')}</Label>
                    <Switch
                      id="loginNotifications"
                      checked={preferences.security.loginNotifications}
                      onCheckedChange={(checked) => handleSecurityChange('loginNotifications', checked)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout" className="mb-2 block">
                      {t('preferences.security.session_timeout')}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="sessionTimeout"
                        min={5}
                        max={120}
                        step={5}
                        value={[preferences.security.sessionTimeout]}
                        onValueChange={([value]) => handleSecurityChange('sessionTimeout', value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <span className="w-16 text-right">
                        {preferences.security.sessionTimeout} {t('preferences.security.minutes')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('preferences.security.trusted_devices')}</CardTitle>
                <CardDescription>{t('preferences.security.trusted_devices_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.security.trustedDevices.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    {t('preferences.security.no_trusted_devices')}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {preferences.security.trustedDevices.map((deviceId) => (
                      <div key={deviceId} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">{deviceId}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => userPreferencesService.removeTrustedDevice(deviceId)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => userPreferencesService.addTrustedDevice(`device-${Date.now()}`)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {t('preferences.security.add_current_device')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPreferencesPage;
