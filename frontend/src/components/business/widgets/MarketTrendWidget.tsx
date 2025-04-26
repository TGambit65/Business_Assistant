import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { perplexityService } from '../../../services/business/perplexityService';
import { Loader2 } from 'lucide-react';

interface MarketTrend {
  date: string;
  marketShare: number;
  revenue: number;
  competitors: number;
  analysis: string;
}

const MarketTrendWidget: React.FC = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isLoading = useCallback(() => {
    return perplexityService.isLoading('marketTrends');
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Loading state is now managed by perplexityService
        setError(null);
        // TODO: Make industry configurable
        const trendData = await perplexityService.getMarketTrends('technology');
        setTrends(trendData);
      } catch (err) {
        setError('Failed to fetch market trends');
        console.error('Error fetching trends:', err);
      }
    };

    fetchTrends();
    // Refresh trends every hour
    const interval = setInterval(fetchTrends, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>Real-time market analysis and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Market Trends</CardTitle>
        <CardDescription>Real-time market analysis and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading() ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                    itemStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{
                      paddingBottom: '10px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="marketShare" 
                    name="Market Share (%)"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue (K)"
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="competitors" 
                    name="Competitor Activity"
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {trends.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                <h4 className="font-medium mb-2">Latest Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {trends[trends.length - 1].analysis}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketTrendWidget;