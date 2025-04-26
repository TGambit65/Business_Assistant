import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { Progress } from "../ui/progress";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { analyticsService } from '../../services/AnalyticsService';
import { securityManager } from '../../security';

// Color schemes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const RADIAN = Math.PI / 180;

/**
 * PerformanceIndicators Component
 * Displays key performance metrics and indicators with proper security handling
 */
const PerformanceIndicators = ({ timeRange, metrics }) => {
  // State for performance data
  const [performanceData, setPerformanceData] = useState({
    conversionRate: 0,
    bounceRate: 0,
    responseTime: 0,
    deliverability: 0,
    satisfaction: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load performance data
  useEffect(() => {
    const loadPerformanceData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        // For now, we'll generate sample data
        
        // First get user analytics from the analytics service
        const userAnalytics = await analyticsService.getUserAnalytics();
        
        // Sanitize data using security manager
        const sanitizedAnalytics = securityManager.sanitizeObject(userAnalytics);
        
        // Calculate performance metrics
        const conversionRate = calculateConversionRate(metrics);
        const bounceRate = calculateBounceRate(metrics);
        const deliverability = calculateDeliverability(metrics);
        
        // Set performance data
        setPerformanceData({
          conversionRate,
          bounceRate,
          responseTime: sanitizedAnalytics.responseTime / 60, // Convert minutes to hours
          deliverability,
          satisfaction: 85 + Math.floor(Math.random() * 10)
        });
        
        // Set category data
        setCategoryData(generateCategoryData());
      } catch (error) {
        console.error('Error loading performance data:', error);
        
        // Fallback to default data
        setPerformanceData({
          conversionRate: 24,
          bounceRate: 12,
          responseTime: 2.4,
          deliverability: 98,
          satisfaction: 89
        });
        
        setCategoryData(generateCategoryData());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPerformanceData();
  }, [timeRange, metrics]);
  
  // Calculate conversion rate based on metrics
  const calculateConversionRate = (metricsData) => {
    if (!metricsData['email.clicked'] || !metricsData['email.opened']) {
      return 25; // Default fallback
    }
    
    return Math.round((metricsData['email.clicked'].current / metricsData['email.opened'].current) * 100);
  };
  
  // Calculate bounce rate based on metrics
  const calculateBounceRate = (metricsData) => {
    if (!metricsData['email.sent']) {
      return 8; // Default fallback
    }
    
    // Simulate bounce rate as a percentage of sent emails
    return Math.round(8 + (Math.random() * 4));
  };
  
  // Calculate deliverability based on metrics
  const calculateDeliverability = (metricsData) => {
    if (!metricsData['email.sent']) {
      return 97; // Default fallback
    }
    
    // Simulate deliverability as a high percentage
    return Math.round(97 + (Math.random() * 2));
  };
  
  // Generate category data for the pie chart
  const generateCategoryData = () => {
    return [
      { name: 'Updates', value: 35 + Math.floor(Math.random() * 5) },
      { name: 'Promotions', value: 25 + Math.floor(Math.random() * 5) },
      { name: 'Newsletters', value: 20 + Math.floor(Math.random() * 5) },
      { name: 'Transactional', value: 15 + Math.floor(Math.random() * 5) },
      { name: 'Other', value: 5 + Math.floor(Math.random() * 5) }
    ];
  };
  
  // Custom pie chart label renderer
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Generate performance indicator data for the radial bar chart
  const getPerformanceIndicatorData = () => {
    return [
      {
        name: 'Deliverability',
        value: performanceData.deliverability,
        fill: '#0088FE'
      },
      {
        name: 'Satisfaction',
        value: performanceData.satisfaction,
        fill: '#00C49F'
      },
      {
        name: 'Conversion',
        value: performanceData.conversionRate,
        fill: '#FFBB28'
      }
    ];
  };
  
  // Custom legend formatter for radial bar chart
  const customLegendFormatter = (value, entry) => {
    const { dataKey, color } = entry;
    
    return (
      <span style={{ color, fontWeight: 500, marginRight: 10 }}>
        {value}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Key Metrics Section */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm font-medium mb-1">Conversion Rate</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {performanceData.conversionRate}%
            </span>
            <Badge 
              variant="outline" 
              className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {performanceData.conversionRate > 20 ? 'Good' : 'Average'}
            </Badge>
          </div>
          <Progress 
            value={performanceData.conversionRate} 
            max={40} 
            className="mt-1 h-1.5" 
          />
        </div>
        
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm font-medium mb-1">Bounce Rate</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {performanceData.bounceRate}%
            </span>
            <Badge 
              variant="outline" 
              className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {performanceData.bounceRate < 10 ? 'Low' : 'Average'}
            </Badge>
          </div>
          <Progress 
            value={performanceData.bounceRate} 
            max={30} 
            className="mt-1 h-1.5" 
          />
        </div>
        
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm font-medium mb-1">Response Time</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {performanceData.responseTime.toFixed(1)}h
            </span>
            <Badge 
              variant="outline" 
              className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            >
              {performanceData.responseTime < 2 ? 'Fast' : 'Average'}
            </Badge>
          </div>
          <Progress 
            value={performanceData.responseTime} 
            max={6} 
            className="mt-1 h-1.5" 
          />
        </div>
        
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm font-medium mb-1">Deliverability</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {performanceData.deliverability}%
            </span>
            <Badge 
              variant="outline" 
              className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {performanceData.deliverability > 97 ? 'Excellent' : 'Good'}
            </Badge>
          </div>
          <Progress 
            value={performanceData.deliverability} 
            max={100} 
            className="mt-1 h-1.5" 
          />
        </div>
      </div>
      
      {/* Email Categories Pie Chart */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md flex flex-col h-full">
          <div className="text-sm font-medium mb-2">Email Categories</div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Proportion']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Performance Indicators Radial Chart */}
        <div className="bg-muted dark:bg-gray-800 p-3 rounded-md flex flex-col h-full">
          <div className="text-sm font-medium mb-2">Key Indicators</div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="80%" 
                data={getPerformanceIndicatorData()} 
                startAngle={180} 
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  label={{ fill: '#666', position: 'insideStart' }}
                  background
                  clockWise={true}
                  dataKey="value"
                />
                <Legend 
                  iconSize={10} 
                  width={120} 
                  height={140} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={customLegendFormatter}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Export Button */}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm">
          Export Reports
        </Button>
      </div>
    </div>
  );
};

export default PerformanceIndicators; 