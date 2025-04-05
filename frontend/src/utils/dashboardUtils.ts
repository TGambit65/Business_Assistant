import { UrgentAction } from '../types/dashboard';

export const getPriorityClass = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'border-red-500/50';
    case 'medium':
      return 'border-yellow-500/50';
    case 'low':
      return 'border-green-500/50';
    default:
      return '';
  }
};

export const getPriorityBadge = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return '';
  }
};

export const sortByPriority = (actions: UrgentAction[]): UrgentAction[] => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...actions].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const getTrendColor = (trend?: 'up' | 'down' | 'neutral'): string => {
  switch (trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}; 