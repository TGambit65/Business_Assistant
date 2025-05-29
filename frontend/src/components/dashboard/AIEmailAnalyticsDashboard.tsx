import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { aiEmailAnalyticsService } from '../../services/AIEmailAnalyticsService';
import type { 
  AIEmailMetrics, 
  AnalyticsSummary, 
  RealTimeAnalytics,
  AnalyticsFilter,
  AnalyticsExportOptions
} from '../../types/analytics';
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
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Star
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AIEmailAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIEmailMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    loadAnalytics();
    loadRealTimeData();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadRealTimeData();
    }, 10000); // Update every 10 seconds

    setRefreshInterval(interval as any);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dateRange, selectedFeature]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const filter: AnalyticsFilter = {
        dateRange,
        featureType: selectedFeature === 'all' ? undefined : [selectedFeature]
      };

      const [metricsData, summaryData] = await Promise.all([
        aiEmailAnalyticsService.getMetrics(filter),
        aiEmailAnalyticsService.getAnalyticsSummary(filter)
      ]);

      setMetrics(metricsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const data = await aiEmailAnalyticsService.getRealTimeAnalytics();
      setRealTimeData(data);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  };

  const handleExport = async () => {
    const options: AnalyticsExportOptions = {
      format: exportFormat,
      dateRange,
      includeCharts: true,
      includeRawData: exportFormat === 'json'
    };

    try {
      const blob = await aiEmailAnalyticsService.exportAnalytics(options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-email-analytics-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const emailsByTypeData = metrics ? Object.entries(metrics.emailsByType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  })) : [];

  const satisfactionData = metrics ? Object.entries(metrics.satisfactionByType).map(([type, rating]) => ({
    feature: type.charAt(0).toUpperCase() + type.slice(1),
    satisfaction: rating
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Email Analytics</h1>
          <p className="text-muted-foreground">Track and analyze AI-powered email feature usage</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-auto"
          />
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select feature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              <SelectItem value="compose">Compose</SelectItem>
              <SelectItem value="rewrite">Rewrite</SelectItem>
              <SelectItem value="reply">Reply</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="icon" aria-label="Refresh analytics">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="flex justify-between items-center p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{realTimeData.activeUsers} Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{realTimeData.currentSessions} Active Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{realTimeData.liveMetrics.emailsGeneratedLastHour} Emails/Hour</span>
              </div>
            </div>
            <Badge variant="outline" className="animate-pulse">
              Live
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total AI Emails"
            value={summary.totalEmails.toLocaleString()}
            icon={<Mail className="h-4 w-4" />}
            trend="+12%"
          />
          <SummaryCard
            title="Time Saved"
            value={summary.timeSaved}
            icon={<Clock className="h-4 w-4" />}
            trend="+8%"
          />
          <SummaryCard
            title="Satisfaction Score"
            value={`${summary.satisfactionScore}/5`}
            icon={<Star className="h-4 w-4" />}
            trend="+2%"
          />
          <SummaryCard
            title="Acceptance Rate"
            value={summary.acceptanceRate}
            icon={<CheckCircle className="h-4 w-4" />}
            trend="-1%"
          />
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Email Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Email Types Distribution</CardTitle>
                <CardDescription>Breakdown of AI-generated emails by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emailsByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emailsByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Email Generation</CardTitle>
                <CardDescription>7-day trend of AI email generation</CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.trends.daily && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary.trends.daily.datasets[0].data.map((value, index) => ({
                      day: summary.trends.daily.labels[index],
                      emails: value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="emails" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Peak Usage Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>Most active hours for AI email generation</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.peakUsageHours && (
                  <div className="space-y-2">
                    {metrics.peakUsageHours.map((hour, index) => (
                      <div key={hour} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">
                          {hour}:00
                        </span>
                        <Progress 
                          value={(5 - index) * 20} 
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Used Features */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Popularity</CardTitle>
                <CardDescription>Most frequently used AI email features</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.mostUsedFeatures && (
                  <div className="space-y-2">
                    {metrics.mostUsedFeatures.slice(0, 5).map((feature, index) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{feature}</span>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Generation Time by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Average Generation Time</CardTitle>
                <CardDescription>Time taken to generate content by type (ms)</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.generationTimeByType && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(metrics.generationTimeByType).map(([type, time]) => ({
                      type: type.charAt(0).toUpperCase() + type.slice(1),
                      time: Math.round(time)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>Error rate and types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Error Rate</span>
                    <Badge variant={metrics?.errorRate && metrics.errorRate < 5 ? 'success' : 'danger'}>
                      {metrics?.errorRate?.toFixed(2) || '0.00'}%
                    </Badge>
                  </div>
                  {metrics?.errorsByType && Object.keys(metrics.errorsByType).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Error Types:</span>
                      {Object.entries(metrics.errorsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{type}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Satisfaction by Feature */}
            <Card>
              <CardHeader>
                <CardTitle>User Satisfaction by Feature</CardTitle>
                <CardDescription>Average satisfaction rating (1-5 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={satisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="satisfaction" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Acceptance and Modification Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Content Quality Metrics</CardTitle>
                <CardDescription>How users interact with AI-generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Acceptance Rate</span>
                      <span className="text-sm">{metrics?.acceptanceRate?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <Progress value={metrics?.acceptanceRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Modification Rate</span>
                      <span className="text-sm">{metrics?.modificationRate?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <Progress value={metrics?.modificationRate || 0} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {metrics?.acceptanceRate && metrics.acceptanceRate > 80 
                          ? 'High acceptance rate indicates good AI performance'
                          : 'Consider improving AI prompts for better acceptance'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>Download analytics data for reporting</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF Report</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}> = ({ title, value, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3" />
          {trend} from last period
        </p>
      )}
    </CardContent>
  </Card>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-96" />
  </div>
);