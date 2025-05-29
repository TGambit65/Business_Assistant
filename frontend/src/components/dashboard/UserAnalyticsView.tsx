import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { aiEmailAnalyticsService } from '../../services/AIEmailAnalyticsService';
import { MetricTrendLine, FeatureComparisonChart } from './AnalyticsCharts';
import type { UserAnalytics, AnalyticsFilter } from '../../types/analytics';
import {
  User,
  Mail,
  Clock,
  Star,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  BarChart3,
  ChevronLeft
} from 'lucide-react';

interface UserAnalyticsViewProps {
  userId?: string;
  onBack?: () => void;
}

export const UserAnalyticsView: React.FC<UserAnalyticsViewProps> = ({ 
  userId: propUserId,
  onBack 
}) => {
  const { userId: paramUserId } = useParams();
  const userId = propUserId || paramUserId || '';
  
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (userId) {
      loadUserAnalytics();
    }
  }, [userId, timeRange]);

  const loadUserAnalytics = async () => {
    setLoading(true);
    try {
      const filter: AnalyticsFilter = {
        userId,
        dateRange: getDateRangeForTimeRange(timeRange)
      };

      const analytics = await aiEmailAnalyticsService.getUserAnalytics(userId, filter);
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForTimeRange = (range: 'week' | 'month' | 'all') => {
    const end = new Date();
    let start: Date;

    switch (range) {
      case 'week':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return { start, end };
  };

  if (loading) {
    return <UserAnalyticsLoadingSkeleton />;
  }

  if (!userAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available for this user.</p>
      </div>
    );
  }

  const { metrics } = userAnalytics;
  const userLevel = calculateUserLevel(metrics.totalAIGeneratedEmails);
  const nextLevelProgress = calculateLevelProgress(metrics.totalAIGeneratedEmails);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-12 w-12">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold">
              {userId.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">User Analytics</h2>
            <p className="text-muted-foreground">User ID: {userId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* User Level Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-lg font-semibold">Level {userLevel}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.totalAIGeneratedEmails} emails generated
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm text-muted-foreground">Next level in</p>
              <p className="text-lg font-semibold">{100 - nextLevelProgress} emails</p>
            </div>
          </div>
          <Progress value={nextLevelProgress} className="mt-4" />
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Mail className="h-4 w-4" />}
          title="Total Emails"
          value={metrics.totalAIGeneratedEmails.toString()}
          subtitle="AI-generated emails"
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          title="Time Saved"
          value={`${Math.round(metrics.timeSaved)}m`}
          subtitle="Productivity gain"
        />
        <MetricCard
          icon={<Star className="h-4 w-4" />}
          title="Satisfaction"
          value={`${metrics.userSatisfactionRating.toFixed(1)}/5`}
          subtitle="Average rating"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          title="Acceptance"
          value={`${metrics.acceptanceRate.toFixed(0)}%`}
          subtitle="Content accepted"
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Which AI features are used most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.emailsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getFeatureColor(type)}`} />
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Progress 
                          value={(count / metrics.totalAIGeneratedEmails) * 100} 
                          className="w-24"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Patterns</CardTitle>
                <CardDescription>When this user is most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Peak Hours</p>
                    <div className="flex gap-2 flex-wrap">
                      {metrics.peakUsageHours.map(hour => (
                        <Badge key={hour} variant="secondary">
                          {hour}:00
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Session Duration</p>
                    <p className="text-2xl font-bold">
                      {Math.round(metrics.averageSessionDuration)} min
                    </p>
                    <p className="text-sm text-muted-foreground">Average per session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average generation time by feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.generationTimeByType).map(([type, time]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{Math.round(time)}ms</span>
                        <Badge variant={time < 1000 ? 'success' : 'warning'}>
                          {time < 1000 ? 'Fast' : 'Slow'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Quality */}
            <Card>
              <CardHeader>
                <CardTitle>Content Quality</CardTitle>
                <CardDescription>How well AI content performs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Acceptance Rate</span>
                    <span className="text-sm font-medium">{metrics.acceptanceRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.acceptanceRate} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Modification Rate</span>
                    <span className="text-sm font-medium">{metrics.modificationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.modificationRate} />
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {metrics.acceptanceRate > 80 
                      ? '✨ Excellent AI adoption rate!'
                      : '💡 Consider refining prompts for better results'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <FeatureComparisonChart
            data={Object.entries(metrics.satisfactionByType).map(([feature, satisfaction]) => ({
              feature: feature.charAt(0).toUpperCase() + feature.slice(1),
              satisfaction,
              usage: (metrics.emailsByType[feature as keyof typeof metrics.emailsByType] / metrics.totalAIGeneratedEmails) * 5
            }))}
            title="Feature Preferences"
            description="Satisfaction vs usage for each feature"
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <UserAchievements metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}> = ({ icon, title, value, subtitle }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

const UserAchievements: React.FC<{ metrics: UserAnalytics['metrics'] }> = ({ metrics }) => {
  const achievements = [
    {
      id: 'first_email',
      name: 'First Steps',
      description: 'Generated your first AI email',
      icon: '🎯',
      unlocked: metrics.totalAIGeneratedEmails >= 1
    },
    {
      id: 'power_user',
      name: 'Power User',
      description: 'Generated 100 AI emails',
      icon: '⚡',
      unlocked: metrics.totalAIGeneratedEmails >= 100
    },
    {
      id: 'time_saver',
      name: 'Time Saver',
      description: 'Saved over 60 minutes',
      icon: '⏱️',
      unlocked: metrics.timeSaved >= 60
    },
    {
      id: 'quality_champion',
      name: 'Quality Champion',
      description: 'Maintained 90%+ acceptance rate',
      icon: '🏆',
      unlocked: metrics.acceptanceRate >= 90
    },
    {
      id: 'feature_explorer',
      name: 'Feature Explorer',
      description: 'Used all 5 AI features',
      icon: '🔍',
      unlocked: Object.values(metrics.emailsByType).every(count => count > 0)
    },
    {
      id: 'satisfaction_master',
      name: 'Satisfaction Master',
      description: 'Achieved 4.5+ average rating',
      icon: '⭐',
      unlocked: metrics.userSatisfactionRating >= 4.5
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map(achievement => (
        <Card 
          key={achievement.id} 
          className={achievement.unlocked ? '' : 'opacity-50'}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                {achievement.unlocked && (
                  <Badge className="mt-2" variant="success">Unlocked</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const UserAnalyticsLoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
  </div>
);

const calculateUserLevel = (totalEmails: number): number => {
  return Math.floor(totalEmails / 100) + 1;
};

const calculateLevelProgress = (totalEmails: number): number => {
  return totalEmails % 100;
};

const getFeatureColor = (feature: string): string => {
  const colors: Record<string, string> = {
    compose: 'bg-blue-500',
    rewrite: 'bg-green-500',
    reply: 'bg-yellow-500',
    summarize: 'bg-purple-500',
    draft: 'bg-pink-500'
  };
  return colors[feature] || 'bg-gray-500';
};