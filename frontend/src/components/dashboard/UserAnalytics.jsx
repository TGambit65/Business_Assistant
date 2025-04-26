import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useWebSocketAnalytics } from '../../hooks/useWebSocketAnalytics';
import { timeRanges } from '../../config/chartConfig';
import MetricsChart from './MetricsChart';

const UserAnalytics = () => {
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
        Error loading user analytics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
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
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics['user.active'].current}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics['user.active'].change > 0 ? '+' : ''}{metrics['user.active'].change}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Email Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics['email.opened'].current / metrics['user.active'].current) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of active users engaged with emails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Click Through Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics['email.clicked'].current / metrics['user.active'].current) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of active users clicked email links
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed user engagement metrics and interaction patterns will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User segmentation and demographic data will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalytics; 