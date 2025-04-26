import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { SearchParams } from '../../../../src/types/search';

interface SearchAnalyticsProps {
  onExportData: () => void;
}

interface SearchEvent {
  id: string;
  timestamp: number;
  query: string;
  filters: string[];
  resultCount: number;
  timeSpent: number;
  success: boolean;
}

interface AnalyticsData {
  totalSearches: number;
  averageTimeSpent: number;
  successRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  popularFilters: Array<{ filter: string; count: number }>;
  searchesOverTime: Array<{
    date: string;
    count: number;
    successRate: number;
  }>;
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  onExportData
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSearches: 0,
    averageTimeSpent: 0,
    successRate: 0,
    popularQueries: [],
    popularFilters: [],
    searchesOverTime: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const savedEvents = localStorage.getItem('searchEvents');
    if (!savedEvents) return;

    const events: SearchEvent[] = JSON.parse(savedEvents);
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter events from last 30 days
    const recentEvents = events.filter(event => event.timestamp > thirtyDaysAgo);

    // Calculate basic stats
    const totalSearches = recentEvents.length;
    const totalTimeSpent = recentEvents.reduce((sum, event) => sum + event.timeSpent, 0);
    const successfulSearches = recentEvents.filter(event => event.success).length;

    // Calculate popular queries
    const queryCounts = recentEvents.reduce((acc, event) => {
      acc[event.query] = (acc[event.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularQueries = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate popular filters
    const filterCounts = recentEvents.reduce((acc, event) => {
      event.filters.forEach(filter => {
        acc[filter] = (acc[filter] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const popularFilters = Object.entries(filterCounts)
      .map(([filter, count]) => ({ filter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate searches over time
    const searchesByDate = recentEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, success: 0 };
      }
      acc[date].count++;
      if (event.success) acc[date].success++;
      return acc;
    }, {} as Record<string, { count: number; success: number }>);

    const searchesOverTime = Object.entries(searchesByDate)
      .map(([date, data]) => ({
        date,
        count: data.count,
        successRate: (data.success / data.count) * 100
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Wrap state update in act if possible, though usually not needed outside tests
    // import { act } from 'react'; // Would need this import
    // act(() => { 
      setAnalytics({
      totalSearches,
      averageTimeSpent: totalSearches > 0 ? totalTimeSpent / totalSearches : 0,
      successRate: totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0,
      popularQueries,
      popularFilters,
      searchesOverTime
    });
    // });
  };

  const trackSearch = (params: SearchParams, resultCount: number, timeSpent: number, success: boolean) => {
    const event: SearchEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      query: params.query,
      filters: params.filters.map(f => `${f.field} ${f.operator}`),
      resultCount,
      timeSpent,
      success
    };

    const savedEvents = localStorage.getItem('searchEvents');
    const events: SearchEvent[] = savedEvents ? JSON.parse(savedEvents) : [];
    events.push(event);
    localStorage.setItem('searchEvents', JSON.stringify(events));

    loadAnalytics();
  };

  return (
    <div className="p-6 bg-background rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Search Analytics</h2>
        <button
          onClick={onExportData}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Total Searches</h3>
          <p className="text-2xl font-semibold text-foreground">
            {analytics.totalSearches}
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Average Time Spent</h3>
          <p className="text-2xl font-semibold text-foreground">
            {analytics.averageTimeSpent.toFixed(1)}s
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="text-2xl font-semibold text-foreground">
            {analytics.successRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Popular Queries</h3>
          <ul className="space-y-2">
            {analytics.popularQueries.map(({ query, count }) => (
              <li
                key={query}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{query}</span>
                <span className="font-medium text-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Popular Filters</h3>
          <ul className="space-y-2">
            {analytics.popularFilters.map(({ filter, count }) => (
              <li
                key={filter}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{filter}</span>
                <span className="font-medium text-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-foreground mb-4">Searches Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.searchesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                name="Search Count"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="#10B981"
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 