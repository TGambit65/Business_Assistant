import React from 'react';
import MetricsChart from './MetricsChart';
import PerformanceIndicators from './PerformanceIndicators';
import { analyticsService } from '../../services/AnalyticsService';
import { webSocketService } from '../../services/WebSocketService';

export interface AnalyticsDashboardProps {
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ timeRange = 'week' }) => {
  const [socketStatus, setSocketStatus] = React.useState<'connected' | 'disconnected'>('disconnected');
  const [metrics, setMetrics] = React.useState<any>(null);

  React.useEffect(() => {
    const loadMetrics = async () => {
      const data = await analyticsService.getUserAnalytics();
      setMetrics(data);
    };
    loadMetrics();

    // Set up WebSocket connection
    const handleStatusChange = (status: string) => {
      setSocketStatus(status as 'connected' | 'disconnected');
    };

    webSocketService.addStatusListener(handleStatusChange);
    webSocketService.connect('wss://api.example.com/ws');

    // Cleanup
    return () => {
      webSocketService.removeStatusListener(handleStatusChange);
      webSocketService.disconnect();
    };
  }, []);

  return (
    <div className="analytics-dashboard">
      <div className="metrics-section">
        <MetricsChart 
          timeRange={timeRange}
          realTime={socketStatus === 'connected'}
          socketStatus={socketStatus}
        />
      </div>
      <div className="performance-section">
        <PerformanceIndicators 
          timeRange={timeRange}
          metrics={metrics}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 