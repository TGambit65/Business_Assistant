import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Sparkles } from 'lucide-react';
import { analyticsService } from '../../services/AnalyticsService';
import { webSocketService, ConnectionState } from '../../services/WebSocketService';
import { securityManager } from '../../security';

// Color palette for the charts
const chartColors = {
  sent: '#8884d8',
  opened: '#82ca9d',
  clicked: '#ffc658',
  active: '#ff7300',
  baseline: '#bbb'
};

/**
 * MetricsChart Component
 * Displays real-time data visualization for key metrics
 */
const MetricsChart = ({ timeRange, realTime, socketStatus }) => {
  // State for chart data and settings
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [isLoading, setIsLoading] = useState(true);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);
  
  // Function to process data from analytics service or websocket
  const processMetricsData = useCallback((rawData, metric) => {
    // First sanitize data through the security manager
    const sanitizedData = securityManager.sanitizeObject(rawData);
    
    // Transform data for charts
    return sanitizedData.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      [metric]: point.value,
      // Add additional security measures here if needed
    }));
  }, []);
  
  // Load chart data from the analytics service
  const loadChartData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Calculate time range
      const now = Date.now();
      let startTime;
      
      switch (timeRange) {
        case 'day':
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case 'week':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case 'quarter':
          startTime = now - 90 * 24 * 60 * 60 * 1000;
          break;
        default:
          startTime = now - 7 * 24 * 60 * 60 * 1000;
      }
      
      // Get the appropriate aggregation level based on timeRange
      const aggregationLevel = timeRange === 'day' ? 'hour' : 'day';
      
      // Load data for each key metric
      const sentData = await analyticsService.getAggregatedData('email.sent', aggregationLevel, startTime);
      const openedData = await analyticsService.getAggregatedData('email.opened', aggregationLevel, startTime);
      const clickedData = await analyticsService.getAggregatedData('email.clicked', aggregationLevel, startTime);
      const activeData = await analyticsService.getAggregatedData('user.active', aggregationLevel, startTime);
      
      // Process the data
      const processedSentData = processMetricsData(sentData, 'sent');
      const processedOpenedData = processMetricsData(openedData, 'opened');
      const processedClickedData = processMetricsData(clickedData, 'clicked');
      const processedActiveData = processMetricsData(activeData, 'active');
      
      // Create a merged dataset with all metrics
      // For simplicity in this example, we'll use the sent data timestamps as the base
      const mergedData = processedSentData.map((item, index) => ({
        timestamp: item.timestamp,
        sent: item.sent || 0,
        opened: processedOpenedData[index]?.opened || 0,
        clicked: processedClickedData[index]?.clicked || 0,
        active: processedActiveData[index]?.active || 0
      }));
      
      // If we have mock data length < 10, generate more data points
      if (mergedData.length < 10) {
        // Generate sample data for demonstration
        const sampleData = generateSampleData(timeRange);
        setChartData(sampleData);
        setTotalDataPoints(sampleData.length);
      } else {
        setChartData(mergedData);
        setTotalDataPoints(mergedData.length);
      }
      
      setRefreshTimestamp(Date.now());
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Generate sample data as fallback
      const sampleData = generateSampleData(timeRange);
      setChartData(sampleData);
      setTotalDataPoints(sampleData.length);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, processMetricsData]);
  
  // Effect to load initial data
  useEffect(() => {
    loadChartData();
  }, [loadChartData, timeRange]);
  
  // Effect to handle real-time updates
  useEffect(() => {
    if (!realTime || socketStatus !== ConnectionState.CONNECTED) {
      return;
    }
    
    // Subscribe to real-time updates
    const handleRealTimeUpdate = (event) => {
      if (event.type === 'analytics' && event.data.metrics) {
        // Flash the realtime indicator
        setRealtimeIndicator(true);
        setTimeout(() => setRealtimeIndicator(false), 500);
        
        // Update chart data
        setChartData(prevData => {
          // Create a deep copy of the previous data
          const newData = [...prevData];
          
          // Process the incoming data point(s)
          const newPoints = event.data.metrics;
          Object.entries(newPoints).forEach(([metric, value]) => {
            // Just update the last data point for simplicity
            if (newData.length > 0) {
              const lastPoint = newData[newData.length - 1];
              lastPoint[metric] = value;
            }
          });
          
          return newData;
        });
      }
    };
    
    // Add real-time data listener
    webSocketService.addEventListener('analytics', handleRealTimeUpdate);
    
    // Clean up when component unmounts or realTime/socketStatus changes
    return () => {
      webSocketService.removeEventListener('analytics', handleRealTimeUpdate);
    };
  }, [realTime, socketStatus]);
  
  // Generate sample data for demonstration
  const generateSampleData = (range) => {
    const data = [];
    let pointCount;
    let baseDate = new Date();
    let timeStep;
    
    switch (range) {
      case 'day':
        pointCount = 24;
        timeStep = 60 * 60 * 1000; // 1 hour
        break;
      case 'week':
        pointCount = 14;
        timeStep = 12 * 60 * 60 * 1000; // 12 hours
        break;
      case 'month':
        pointCount = 30;
        timeStep = 24 * 60 * 60 * 1000; // 1 day
        break;
      case 'quarter':
        pointCount = 30;
        timeStep = 3 * 24 * 60 * 60 * 1000; // 3 days
        break;
      default:
        pointCount = 14;
        timeStep = 12 * 60 * 60 * 1000; // 12 hours
    }
    
    // Start from the beginning of the time range
    baseDate = new Date(Date.now() - pointCount * timeStep);
    
    // Generate data points
    for (let i = 0; i < pointCount; i++) {
      const timestamp = new Date(baseDate.getTime() + i * timeStep);
      
      // Create random data with some correlation
      const sentBase = 100 + Math.floor(Math.random() * 150);
      const openedBase = Math.floor(sentBase * (0.5 + Math.random() * 0.3)); // 50-80% open rate
      const clickedBase = Math.floor(openedBase * (0.2 + Math.random() * 0.3)); // 20-50% click rate
      const activeBase = 1000 + Math.floor(Math.random() * 1500);
      
      data.push({
        timestamp: timestamp.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric', 
          hour: '2-digit',
          minute: '2-digit'
        }),
        sent: sentBase,
        opened: openedBase,
        clicked: clickedBase,
        active: activeBase
      });
    }
    
    return data;
  };
  
  // Render the appropriate chart based on chart type
  const renderChart = () => {
    if (isLoading || chartData.length === 0) {
      return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
    }
    
    // Common chart props
    const chartProps = {
      width: 730,
      height: 250,
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };
    
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sent" 
                stackId="1"
                stroke={chartColors.sent} 
                fill={chartColors.sent} 
                fillOpacity={0.3}
                name="Emails Sent" 
              />
              <Area 
                type="monotone" 
                dataKey="opened" 
                stackId="2"
                stroke={chartColors.opened} 
                fill={chartColors.opened} 
                fillOpacity={0.3}
                name="Emails Opened" 
              />
              <Area 
                type="monotone" 
                dataKey="clicked" 
                stackId="3"
                stroke={chartColors.clicked} 
                fill={chartColors.clicked} 
                fillOpacity={0.3}
                name="Links Clicked" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend />
              <Bar dataKey="sent" fill={chartColors.sent} name="Emails Sent" />
              <Bar dataKey="opened" fill={chartColors.opened} name="Emails Opened" />
              <Bar dataKey="clicked" fill={chartColors.clicked} name="Links Clicked" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'user':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke={chartColors.active} 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Active Users" 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke={chartColors.sent} 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Emails Sent" 
              />
              <Line 
                type="monotone" 
                dataKey="opened" 
                stroke={chartColors.opened} 
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="Emails Opened" 
              />
              <Line 
                type="monotone" 
                dataKey="clicked" 
                stroke={chartColors.clicked} 
                strokeWidth={2}
                activeDot={{ r: 4 }}
                name="Links Clicked" 
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="line" value={chartType} onValueChange={setChartType}>
          <TabsList>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center">
          {realTime && (
            <Badge 
              variant="outline" 
              className={`mr-2 ${realtimeIndicator ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              <Sparkles className={`h-3 w-3 mr-1 ${realtimeIndicator ? 'animate-pulse' : ''}`} />
              Real-time
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {totalDataPoints} data points • Updated {new Date(refreshTimestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="flex-grow">
        {renderChart()}
      </div>
    </div>
  );
};

export default MetricsChart; 