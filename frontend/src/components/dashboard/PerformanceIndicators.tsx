import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface MetricData {
  current: number;
  previous: number;
  change: number;
}

interface Metrics {
  [key: string]: MetricData;
}

export interface PerformanceIndicatorsProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  metrics: Metrics | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({
  timeRange,
  metrics
}) => {
  const [pieData, setPieData] = React.useState<any[]>([]);
  const [radialData, setRadialData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const transformData = async () => {
      try {
        setIsLoading(true);
        if (metrics) {
          // Simulate data processing delay
          await new Promise(resolve => setTimeout(resolve, 100));

          if (isMounted) {
            // Transform metrics for pie chart
            const pieChartData = Object.entries(metrics).map(([name, data]) => ({
              name,
              value: data.current
            }));
            setPieData(pieChartData);

            // Transform metrics for radial bar chart
            const radialChartData = Object.entries(metrics).map(([name, data]) => ({
              name,
              value: data.change
            }));
            setRadialData(radialChartData);
          }
        }
      } catch (error) {
        console.error('Error transforming metrics data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    transformData();

    return () => {
      isMounted = false;
    };
  }, [metrics]);

  if (isLoading) {
    return <div data-testid="performance-indicators-loading">Loading...</div>;
  }

  if (!metrics) {
    return <div data-testid="performance-indicators-no-data">No data available</div>;
  }

  return (
    <div className="performance-indicators" data-testid="performance-indicators">
      <div className="pie-chart" data-testid="pie-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart data-testid="pie-chart-component">
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="radial-chart" data-testid="radial-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            innerRadius="30%"
            outerRadius="100%"
            data={radialData}
            startAngle={180}
            endAngle={0}
            data-testid="radial-chart-component"
          >
            <RadialBar
              label={{ fill: '#666', position: 'insideStart' }}
              background
              dataKey="value"
            />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceIndicators; 