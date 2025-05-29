// AI Email Analytics Types

export interface AIEmailMetrics {
  // Usage metrics
  totalAIGeneratedEmails: number;
  emailsByType: {
    compose: number;
    rewrite: number;
    reply: number;
    summarize: number;
    draft: number;
  };
  
  // Content metrics
  averageContentLength: number;
  contentLengthByType: {
    compose: number;
    rewrite: number;
    reply: number;
    summarize: number;
    draft: number;
  };
  
  // Performance metrics
  averageGenerationTime: number; // in milliseconds
  generationTimeByType: {
    compose: number;
    rewrite: number;
    reply: number;
    summarize: number;
    draft: number;
  };
  
  // Quality metrics
  userSatisfactionRating: number; // 1-5 scale
  satisfactionByType: {
    compose: number;
    rewrite: number;
    reply: number;
    summarize: number;
    draft: number;
  };
  
  // Efficiency metrics
  timeSaved: number; // in minutes
  acceptanceRate: number; // percentage of AI content accepted
  modificationRate: number; // percentage of AI content modified before sending
  
  // Usage patterns
  peakUsageHours: number[]; // array of hours (0-23)
  mostUsedFeatures: string[];
  averageSessionDuration: number; // in minutes
  
  // Error metrics
  errorRate: number; // percentage
  errorsByType: Record<string, number>;
}

export interface UserAnalytics {
  userId: string;
  metrics: AIEmailMetrics;
  timeRange: {
    start: Date;
    end: Date;
  };
  lastUpdated: Date;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: AIEmailEventType;
  timestamp: Date;
  duration: number; // milliseconds
  metadata: {
    contentLength?: number;
    satisfaction?: number; // 1-5
    accepted?: boolean;
    modified?: boolean;
    errorType?: string;
    feature?: string;
    [key: string]: any;
  };
}

export type AIEmailEventType = 
  | 'compose_start'
  | 'compose_complete'
  | 'rewrite_start'
  | 'rewrite_complete'
  | 'reply_start'
  | 'reply_complete'
  | 'summarize_start'
  | 'summarize_complete'
  | 'draft_start'
  | 'draft_complete'
  | 'content_accepted'
  | 'content_modified'
  | 'content_rejected'
  | 'error_occurred';

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  featureType?: string[];
  minSatisfaction?: number;
}

export interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface AnalyticsExportOptions {
  format: 'csv' | 'pdf' | 'json';
  includeCharts?: boolean;
  includeRawData?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface AnalyticsSummary {
  totalEmails: number;
  timeSaved: string;
  satisfactionScore: number;
  mostUsedFeature: string;
  acceptanceRate: string;
  errorRate: string;
  trends: {
    daily: AnalyticsChartData;
    weekly: AnalyticsChartData;
    monthly: AnalyticsChartData;
  };
}

export interface RealTimeAnalytics {
  activeUsers: number;
  currentSessions: number;
  recentEvents: AnalyticsEvent[];
  liveMetrics: {
    emailsGeneratedLastHour: number;
    averageResponseTime: number;
    currentErrorRate: number;
  };
}