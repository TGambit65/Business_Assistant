import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  RefreshCw,
  Download,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { Badge } from '../../components/ui/badge';
import { AuthEvent, SecurityEvent } from '../../services/AnalyticsService';

// Mock data for the dashboard
// In a real application, this would come from the analytics service
const generateMockData = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  const twoDaysAgo = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  const threeDaysAgo = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  const fourDaysAgo = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  const fiveDaysAgo = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
  const sixDaysAgo = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];

  return {
    loginAttempts: [
      { date: sixDaysAgo, attempts: 120, success: 105, failure: 15 },
      { date: fiveDaysAgo, attempts: 145, success: 130, failure: 15 },
      { date: fourDaysAgo, attempts: 132, success: 120, failure: 12 },
      { date: threeDaysAgo, attempts: 165, success: 150, failure: 15 },
      { date: twoDaysAgo, attempts: 178, success: 160, failure: 18 },
      { date: yesterday, attempts: 156, success: 140, failure: 16 },
      { date: today, attempts: 190, success: 175, failure: 15 },
    ],
    authMethods: [
      { name: 'Password', value: 65 },
      { name: 'Google', value: 20 },
      { name: 'Biometric', value: 15 },
    ],
    mfaUsage: [
      { name: 'MFA Enabled', value: 45 },
      { name: 'MFA Disabled', value: 55 },
    ],
    deviceTypes: [
      { name: 'Desktop', value: 55 },
      { name: 'Mobile', value: 35 },
      { name: 'Tablet', value: 10 },
    ],
    securityEvents: [
      { date: sixDaysAgo, suspicious: 3, brute_force: 1, new_device: 8 },
      { date: fiveDaysAgo, suspicious: 2, brute_force: 0, new_device: 5 },
      { date: fourDaysAgo, suspicious: 4, brute_force: 2, new_device: 7 },
      { date: threeDaysAgo, suspicious: 1, brute_force: 0, new_device: 6 },
      { date: twoDaysAgo, suspicious: 5, brute_force: 3, new_device: 9 },
      { date: yesterday, suspicious: 2, brute_force: 1, new_device: 4 },
      { date: today, suspicious: 3, brute_force: 0, new_device: 6 },
    ],
    recentEvents: [
      {
        id: 1,
        type: AuthEvent.LOGIN_SUCCESS,
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        user: 'john.doe@example.com',
        device: 'Chrome on Windows',
        location: 'New York, USA'
      },
      {
        id: 2,
        type: SecurityEvent.NEW_DEVICE_DETECTED,
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        user: 'jane.smith@example.com',
        device: 'Safari on macOS',
        location: 'San Francisco, USA'
      },
      {
        id: 3,
        type: AuthEvent.LOGIN_FAILURE,
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        user: 'robert.johnson@example.com',
        device: 'Firefox on Linux',
        location: 'London, UK'
      },
      {
        id: 4,
        type: SecurityEvent.SUSPICIOUS_ACTIVITY,
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        user: 'sarah.williams@example.com',
        device: 'Chrome on Android',
        location: 'Tokyo, Japan'
      },
      {
        id: 5,
        type: AuthEvent.MFA_SUCCESS,
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        user: 'michael.brown@example.com',
        device: 'Edge on Windows',
        location: 'Berlin, Germany'
      }
    ]
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AuthAnalyticsDashboard = () => {
  const { t } = useTranslation('analytics');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(generateMockData());

  // Fetch analytics data
  const fetchAnalyticsData = () => {
    setIsLoading(true);

    // In a real application, this would call the analytics service
    // analyticsService.getAuthAnalytics(timeRange, dateRange)
    //   .then(data => setData(data))
    //   .catch(err => console.error('Error fetching analytics:', err))
    //   .finally(() => setIsLoading(false));

    // For now, just use mock data
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 500);
  };

  // Refresh data when time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, dateRange]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get event type badge
  const getEventTypeBadge = (eventType) => {
    if (eventType.includes('success')) {
      return <Badge className="bg-green-500">{eventType}</Badge>;
    } else if (eventType.includes('failure')) {
      return <Badge className="bg-red-500">{eventType}</Badge>;
    } else if (eventType.includes('suspicious') || eventType.includes('brute_force')) {
      return <Badge className="bg-amber-500">{eventType}</Badge>;
    } else {
      return <Badge>{eventType}</Badge>;
    }
  };

  // Export data as CSV
  const exportData = () => {
    // In a real application, this would generate a CSV file
    alert('Data export functionality would be implemented here');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">{t('analytics.description')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('analytics.select_time_range')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t('analytics.time_ranges.24h')}</SelectItem>
              <SelectItem value="7d">{t('analytics.time_ranges.7d')}</SelectItem>
              <SelectItem value="30d">{t('analytics.time_ranges.30d')}</SelectItem>
              <SelectItem value="90d">{t('analytics.time_ranges.90d')}</SelectItem>
              <SelectItem value="custom">{t('analytics.time_ranges.custom')}</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-[280px]"
            />
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            title={t('analytics.refresh')}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={exportData}
            disabled={isLoading}
            title={t('analytics.export')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">{t('analytics.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="security">{t('analytics.tabs.security')}</TabsTrigger>
          <TabsTrigger value="events">{t('analytics.tabs.events')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.login_attempts.title')}</CardTitle>
                <CardDescription>{t('analytics.login_attempts.description')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.loginAttempts}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name]} labelFormatter={formatDate} />
                    <Legend />
                    <Line type="monotone" dataKey="attempts" stroke="#8884d8" name={t('analytics.login_attempts.total')} />
                    <Line type="monotone" dataKey="success" stroke="#82ca9d" name={t('analytics.login_attempts.success')} />
                    <Line type="monotone" dataKey="failure" stroke="#ff8042" name={t('analytics.login_attempts.failure')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.auth_methods.title')}</CardTitle>
                <CardDescription>{t('analytics.auth_methods.description')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.authMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.authMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.mfa_usage.title')}</CardTitle>
                <CardDescription>{t('analytics.mfa_usage.description')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.mfaUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#f87171" />
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.device_types.title')}</CardTitle>
                <CardDescription>{t('analytics.device_types.description')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.deviceTypes}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name={t('analytics.device_types.usage')} fill="#8884d8">
                      {data.deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.summary.title')}</CardTitle>
                <CardDescription>{t('analytics.summary.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-1">
                      {t('analytics.summary.total_logins')}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.loginAttempts.reduce((sum, item) => sum + item.attempts, 0)}
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-green-500 dark:text-green-400 text-sm font-medium mb-1">
                      {t('analytics.summary.success_rate')}
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (data.loginAttempts.reduce((sum, item) => sum + item.success, 0) /
                        data.loginAttempts.reduce((sum, item) => sum + item.attempts, 0)) * 100
                      )}%
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="text-amber-500 dark:text-amber-400 text-sm font-medium mb-1">
                      {t('analytics.summary.mfa_usage')}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.mfaUsage.find(item => item.name === 'MFA Enabled')?.value}%
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-red-500 dark:text-red-400 text-sm font-medium mb-1">
                      {t('analytics.summary.security_events')}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.securityEvents.reduce(
                        (sum, item) => sum + item.suspicious + item.brute_force, 0
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.security_events.title')}</CardTitle>
                <CardDescription>{t('analytics.security_events.description')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.securityEvents}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name]} labelFormatter={formatDate} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="suspicious"
                      stroke="#ff8042"
                      name={t('analytics.security_events.suspicious')}
                    />
                    <Line
                      type="monotone"
                      dataKey="brute_force"
                      stroke="#ff0000"
                      name={t('analytics.security_events.brute_force')}
                    />
                    <Line
                      type="monotone"
                      dataKey="new_device"
                      stroke="#8884d8"
                      name={t('analytics.security_events.new_device')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.security_summary.title')}</CardTitle>
                <CardDescription>{t('analytics.security_summary.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_summary.suspicious_activity')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.securityEvents.reduce((sum, item) => sum + item.suspicious, 0)} {t('analytics.security_summary.events_detected')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_summary.brute_force')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.securityEvents.reduce((sum, item) => sum + item.brute_force, 0)} {t('analytics.security_summary.attempts_blocked')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_summary.new_devices')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.securityEvents.reduce((sum, item) => sum + item.new_device, 0)} {t('analytics.security_summary.devices_registered')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_summary.mfa_protection')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.mfaUsage.find(item => item.name === 'MFA Enabled')?.value}% {t('analytics.security_summary.accounts_protected')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  {t('analytics.security_summary.view_security_report')}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>{t('analytics.security_recommendations.title')}</CardTitle>
                <CardDescription>{t('analytics.security_recommendations.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_recommendations.increase_mfa')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('analytics.security_recommendations.increase_mfa_description')}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-sm mt-1">
                        {t('analytics.security_recommendations.learn_more')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full shrink-0">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_recommendations.review_devices')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('analytics.security_recommendations.review_devices_description')}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-sm mt-1">
                        {t('analytics.security_recommendations.view_devices')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{t('analytics.security_recommendations.enable_biometric')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('analytics.security_recommendations.enable_biometric_description')}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-sm mt-1">
                        {t('analytics.security_recommendations.setup_now')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('analytics.recent_events.title')}</CardTitle>
              <CardDescription>{t('analytics.recent_events.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentEvents.map((event) => (
                  <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-2">
                    <div className="flex items-center gap-3">
                      {event.type.includes('success') ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      ) : event.type.includes('failure') ? (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      ) : event.type.includes('suspicious') || event.type.includes('brute_force') ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                      )}
                      <div>
                        <div className="font-medium">{event.user}</div>
                        <div className="text-sm text-muted-foreground">{event.device}</div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                      <div className="text-sm">{event.location}</div>
                      <div>{getEventTypeBadge(event.type)}</div>
                      <div className="text-sm text-muted-foreground">{formatTimestamp(event.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <Button variant="outline">
                {t('analytics.recent_events.view_all_events')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthAnalyticsDashboard;
