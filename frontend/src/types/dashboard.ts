import { ReactNode } from 'react';

export interface QuickAccessItem {
  label: string;
  icon: ReactNode;
  action: () => void;
}

export interface UrgentAction {
  id: string;
  title: string;
  icon: ReactNode;
  priority: 'high' | 'medium' | 'low';
  from?: string;
  time: string;
  action: () => void;
}

export interface EmailSummary {
  id: string;
  title: string;
  summary: string;
  from: string;
  time: string;
  icon: ReactNode;
  label: string;
  labelColor: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardStat {
  label: string;
  value: number;
  icon: ReactNode;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CommonCardProps {
  className?: string;
  children: ReactNode;
} 