import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useWebSocketAnalytics } from '../../hooks/useWebSocketAnalytics';
import { timeRanges } from '../../config/chartConfig';
import MetricsChart from './MetricsChart';

const EmailAnalytics = () => {
  const { socketStatus, realTimeEnabled, webSocketService } = useWebSocketAnalytics();
  const { metrics, isLoading, error } = useAnalyticsData(timeRanges.WEEK, realTimeEnabled, webSocketService);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading email analytics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart
                timeRange={timeRanges.WEEK}
                realTime={realTimeEnabled}
                socketStatus={socketStatus}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics['email.sent'].current / metrics['email.sent'].previous) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.sent'].change > 0 ? '+' : ''}{metrics['email.sent'].change}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics['email.opened'].current / metrics['email.sent'].current) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.opened'].change > 0 ? '+' : ''}{metrics['email.opened'].change}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics['email.clicked'].current / metrics['email.opened'].current) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics['email.clicked'].change > 0 ? '+' : ''}{metrics['email.clicked'].change}% from last period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed delivery metrics and bounce rates will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed engagement metrics and user interactions will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAnalytics; 