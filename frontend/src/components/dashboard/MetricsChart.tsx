import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export interface MetricsChartProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  realTime: boolean;
  socketStatus: 'connected' | 'disconnected';
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  timeRange,
  realTime,
  socketStatus
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate data loading
        const mockData = [
          { name: 'Mon', value: 400 },
          { name: 'Tue', value: 300 },
          { name: 'Wed', value: 200 },
          { name: 'Thu', value: 278 },
          { name: 'Fri', value: 189 },
          { name: 'Sat', value: 239 },
          { name: 'Sun', value: 349 }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        if (isMounted) {
          setData(mockData);
        }
      } catch (error) {
        console.error('Error loading metrics data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  if (isLoading) {
    return <div data-testid="metrics-chart-loading">Loading...</div>;
  }

  return (
    <div className="metrics-chart" data-testid="metrics-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart; 