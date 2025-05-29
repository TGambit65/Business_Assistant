import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import type { AnalyticsChartData } from '../../types/analytics';

interface ChartProps {
  data: any[];
  title?: string;
  description?: string;
  height?: number;
}

export const EmailVolumeChart: React.FC<ChartProps> = ({ 
  data, 
  title = "Email Volume Over Time",
  description = "Daily email generation trends",
  height = 300 
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="emails" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorEmails)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const FeatureComparisonChart: React.FC<ChartProps> = ({ 
  data,
  title = "Feature Performance Comparison",
  description = "Compare performance metrics across features",
  height = 300
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="feature" />
          <PolarRadiusAxis angle={90} domain={[0, 5]} />
          <Radar 
            name="Satisfaction" 
            dataKey="satisfaction" 
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.6} 
          />
          <Radar 
            name="Usage" 
            dataKey="usage" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.6} 
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const ResponseTimeChart: React.FC<ChartProps> = ({
  data,
  title = "Response Time Analysis",
  description = "AI generation response times by feature",
  height = 300
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="feature" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="avgTime" fill="#8884d8" name="Avg Time (ms)" />
          <Line yAxisId="right" type="monotone" dataKey="p95Time" stroke="#82ca9d" name="95th Percentile (ms)" />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const ContentLengthDistribution: React.FC<ChartProps> = ({
  data,
  title = "Content Length Distribution",
  description = "Distribution of generated content lengths",
  height = 300
}) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const HourlyActivityHeatmap: React.FC<{
  data: { hour: number; day: string; value: number }[];
  title?: string;
  description?: string;
}> = ({
  data,
  title = "Activity Heatmap",
  description = "Email generation activity by hour and day"
}) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensity = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-400';
  };
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-25 gap-1 text-xs">
          <div className="col-span-1"></div>
          {hours.map(hour => (
            <div key={hour} className="text-center text-muted-foreground">
              {hour}
            </div>
          ))}
          {days.map(day => (
            <React.Fragment key={day}>
              <div className="text-right pr-2 text-muted-foreground">{day}</div>
              {hours.map(hour => {
                const dataPoint = data.find(d => d.day === day && d.hour === hour);
                const value = dataPoint?.value || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`aspect-square rounded-sm ${getIntensity(value, maxValue)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                    title={`${day} ${hour}:00 - ${value} emails`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricTrendLine: React.FC<{
  data: { time: string; value: number }[];
  metric: string;
  color?: string;
  height?: number;
}> = ({
  data,
  metric,
  color = '#3B82F6',
  height = 100
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke={color} 
        strokeWidth={2}
        dot={false}
      />
      <Tooltip 
        contentStyle={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          border: 'none',
          borderRadius: '4px',
          color: 'white'
        }}
        labelFormatter={(label) => `Time: ${label}`}
        formatter={(value: any) => [`${metric}: ${value}`, '']}
      />
    </LineChart>
  </ResponsiveContainer>
);