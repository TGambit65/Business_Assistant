import React from 'react';
import { Card } from '../ui/Card';
import { DashboardStat } from '../../types/dashboard';
import { formatStatValue, getTrendColor } from '../../utils/dashboardUtils';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStat[];
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <ArrowUp className="w-4 h-4" />;
    case 'down':
      return <ArrowDown className="w-4 h-4" />;
    default:
      return <ArrowRight className="w-4 h-4" />;
  }
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-full bg-muted">
              {stat.icon}
            </div>
            {stat.change !== undefined && (
              <div className={`flex items-center ${getTrendColor(stat.trend)}`}>
                {getTrendIcon(stat.trend)}
                <span className="ml-1 text-sm">{stat.change}%</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-semibold mt-1">
              {formatStatValue(stat.value)}
            </h3>
          </div>
        </Card>
      ))}
    </div>
  );
}; 