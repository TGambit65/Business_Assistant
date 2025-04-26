import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { RefreshCw, Shield, Clock, BarChart3, LineChart, PieChart, Activity, Database, Lock, Info } from 'lucide-react';
import { useWebSocketAnalytics } from '../../hooks/useWebSocketAnalytics';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { timeRanges } from '../../config/chartConfig';
import MetricsChart from './MetricsChart';
import PerformanceIndicators from './PerformanceIndicators';
import ConnectionStatus from './ConnectionStatus';
import TimeRangeSelector from './TimeRangeSelector';
import { withResourceSafety } from '../common/ResourceSafeComponent';
import { useRenderGuard } from '../../utils/renderGuard';

/**
 * Analytics Dashboard Component
 * Provides a secure and performant dashboard with real-time data visualization
 */
const AnalyticsDashboard = () => {
  // Use render guard to prevent infinite loops
  useRenderGuard('AnalyticsDashboard');
  
  // State for time range
  const [timeRange, setTimeRange] = useState(timeRanges.WEEK);
  
  // Use custom hooks for WebSocket and data management
  const { socketStatus, realTimeEnabled, toggleRealTime, webSocketService } = useWebSocketAnalytics();
  const { metrics, isLoading, error, loadMetricsData } = useAnalyticsData(timeRange, realTimeEnabled, webSocketService);
  
  // Handle manual refresh
  const handleRefresh = () => {
    loadMetricsData();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Secure and real-time analytics for your email performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleRealTime}
            className={realTimeEnabled ? 'text-primary' : ''}
          >
            <Activity className="h-4 w-4" />
          </Button>
          <ConnectionStatus status={socketStatus} realTimeEnabled={realTimeEnabled} />
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics['email.sent'].current}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.sent'].change > 0 ? '+' : ''}{metrics['email.sent'].change}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Opened</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics['email.opened'].current}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.opened'].change > 0 ? '+' : ''}{metrics['email.opened'].change}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Clicked</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics['email.clicked'].current}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.clicked'].change > 0 ? '+' : ''}{metrics['email.clicked'].change}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics['user.active'].current}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics['user.active'].change > 0 ? '+' : ''}{metrics['user.active'].change}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <MetricsChart
              timeRange={timeRange}
              realTime={realTimeEnabled}
              socketStatus={socketStatus}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicators metrics={metrics} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withResourceSafety(AnalyticsDashboard); 