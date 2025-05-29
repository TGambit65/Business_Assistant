/**
 * AI Email Analytics Service
 * 
 * Provides specialized analytics for AI-powered email features including
 * tracking, aggregation, and reporting of AI email metrics.
 */

import { analyticsService } from './AnalyticsService';
import { LocalStorageService } from './LocalStorageService';
import type { 
  AIEmailMetrics, 
  AnalyticsEvent, 
  AIEmailEventType,
  UserAnalytics,
  AnalyticsFilter,
  AnalyticsSummary,
  RealTimeAnalytics,
  AnalyticsChartData,
  AnalyticsExportOptions
} from '../types/analytics';

const STORAGE_KEY = 'ai_email_analytics';
const EVENTS_STORAGE_KEY = 'ai_email_analytics_events';

export class AIEmailAnalyticsService {
  private static instance: AIEmailAnalyticsService;
  private localStorage: LocalStorageService;
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number = Date.now();
  private activeTimers: Map<string, number> = new Map();

  private constructor() {
    this.localStorage = LocalStorageService.getInstance();
    this.loadStoredEvents();
    this.startPeriodicFlush();
  }

  public static getInstance(): AIEmailAnalyticsService {
    if (!AIEmailAnalyticsService.instance) {
      AIEmailAnalyticsService.instance = new AIEmailAnalyticsService();
    }
    return AIEmailAnalyticsService.instance;
  }

  /**
   * Track the start of an AI email action
   */
  public trackActionStart(eventType: AIEmailEventType, metadata: Record<string, any> = {}): string {
    const eventId = this.generateEventId();
    const event: AnalyticsEvent = {
      id: eventId,
      userId: this.getCurrentUserId(),
      eventType,
      timestamp: new Date(),
      duration: 0,
      metadata
    };

    // Store the start time for duration calculation
    this.activeTimers.set(eventId, Date.now());
    
    // Track in general analytics
    analyticsService.trackMetric(`ai_email.${eventType}`, 1, metadata);

    return eventId;
  }

  /**
   * Track the completion of an AI email action
   */
  public trackActionComplete(
    eventId: string, 
    eventType: AIEmailEventType, 
    metadata: Record<string, any> = {}
  ): void {
    const startTime = this.activeTimers.get(eventId);
    if (!startTime) {
      console.warn(`No start time found for event ${eventId}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.activeTimers.delete(eventId);

    const event: AnalyticsEvent = {
      id: eventId,
      userId: this.getCurrentUserId(),
      eventType,
      timestamp: new Date(),
      duration,
      metadata: {
        ...metadata,
        duration
      }
    };

    this.events.push(event);
    this.saveEvents();

    // Track completion in general analytics
    analyticsService.trackMetric(`ai_email.${eventType}_duration`, duration, metadata);
  }

  /**
   * Track user satisfaction rating
   */
  public trackSatisfaction(
    feature: string, 
    rating: number, 
    eventId?: string
  ): void {
    const metadata = {
      feature,
      rating,
      eventId
    };

    analyticsService.trackMetric('ai_email.satisfaction', rating, metadata);

    // Update the event if eventId is provided
    if (eventId) {
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        event.metadata.satisfaction = rating;
        this.saveEvents();
      }
    }
  }

  /**
   * Track content acceptance/rejection
   */
  public trackContentDecision(
    eventId: string,
    accepted: boolean,
    modified: boolean = false
  ): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.metadata.accepted = accepted;
      event.metadata.modified = modified;
      this.saveEvents();
    }

    const decisionType = accepted ? 
      (modified ? 'content_modified' : 'content_accepted') : 
      'content_rejected';

    analyticsService.trackMetric(`ai_email.${decisionType}`, 1);
  }

  /**
   * Track errors
   */
  public trackError(
    feature: string,
    errorType: string,
    errorMessage?: string
  ): void {
    const metadata = {
      feature,
      errorType,
      errorMessage
    };

    analyticsService.trackMetric('ai_email.error', 1, metadata);

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      userId: this.getCurrentUserId(),
      eventType: 'error_occurred',
      timestamp: new Date(),
      duration: 0,
      metadata
    };

    this.events.push(event);
    this.saveEvents();
  }

  /**
   * Get aggregated metrics for a time range
   */
  public async getMetrics(filter?: AnalyticsFilter): Promise<AIEmailMetrics> {
    const filteredEvents = this.filterEvents(filter);
    
    return {
      totalAIGeneratedEmails: filteredEvents.length,
      emailsByType: this.countByType(filteredEvents),
      averageContentLength: this.calculateAverageContentLength(filteredEvents),
      contentLengthByType: this.calculateContentLengthByType(filteredEvents),
      averageGenerationTime: this.calculateAverageDuration(filteredEvents),
      generationTimeByType: this.calculateDurationByType(filteredEvents),
      userSatisfactionRating: this.calculateAverageSatisfaction(filteredEvents),
      satisfactionByType: this.calculateSatisfactionByType(filteredEvents),
      timeSaved: this.calculateTimeSaved(filteredEvents),
      acceptanceRate: this.calculateAcceptanceRate(filteredEvents),
      modificationRate: this.calculateModificationRate(filteredEvents),
      peakUsageHours: this.calculatePeakUsageHours(filteredEvents),
      mostUsedFeatures: this.getMostUsedFeatures(filteredEvents),
      averageSessionDuration: this.calculateSessionDuration(),
      errorRate: this.calculateErrorRate(filteredEvents),
      errorsByType: this.countErrorsByType(filteredEvents)
    };
  }

  /**
   * Get user-specific analytics
   */
  public async getUserAnalytics(userId: string, filter?: AnalyticsFilter): Promise<UserAnalytics> {
    const userFilter = { ...filter, userId };
    const metrics = await this.getMetrics(userFilter);

    return {
      userId,
      metrics,
      timeRange: {
        start: filter?.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: filter?.dateRange?.end || new Date()
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Get analytics summary
   */
  public async getAnalyticsSummary(filter?: AnalyticsFilter): Promise<AnalyticsSummary> {
    const metrics = await this.getMetrics(filter);
    
    return {
      totalEmails: metrics.totalAIGeneratedEmails,
      timeSaved: `${Math.round(metrics.timeSaved)} minutes`,
      satisfactionScore: Math.round(metrics.userSatisfactionRating * 10) / 10,
      mostUsedFeature: metrics.mostUsedFeatures[0] || 'compose',
      acceptanceRate: `${Math.round(metrics.acceptanceRate)}%`,
      errorRate: `${Math.round(metrics.errorRate * 100) / 100}%`,
      trends: {
        daily: await this.getDailyTrends(filter),
        weekly: await this.getWeeklyTrends(filter),
        monthly: await this.getMonthlyTrends(filter)
      }
    };
  }

  /**
   * Get real-time analytics
   */
  public async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= oneHourAgo);
    
    return {
      activeUsers: new Set(recentEvents.map(e => e.userId)).size,
      currentSessions: this.activeTimers.size,
      recentEvents: recentEvents.slice(-10),
      liveMetrics: {
        emailsGeneratedLastHour: recentEvents.length,
        averageResponseTime: this.calculateAverageDuration(recentEvents),
        currentErrorRate: this.calculateErrorRate(recentEvents)
      }
    };
  }

  /**
   * Export analytics data
   */
  public async exportAnalytics(options: AnalyticsExportOptions): Promise<Blob> {
    const filter: AnalyticsFilter = {
      dateRange: options.dateRange
    };

    const metrics = await this.getMetrics(filter);
    const summary = await this.getAnalyticsSummary(filter);

    switch (options.format) {
      case 'csv':
        return this.exportAsCSV(metrics, options);
      case 'pdf':
        return this.exportAsPDF(summary, options);
      case 'json':
        return this.exportAsJSON({ metrics, summary, events: options.includeRawData ? this.filterEvents(filter) : undefined });
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Private helper methods

  private filterEvents(filter?: AnalyticsFilter): AnalyticsEvent[] {
    let events = [...this.events];

    if (filter?.dateRange) {
      events = events.filter(e => 
        e.timestamp >= filter.dateRange!.start && 
        e.timestamp <= filter.dateRange!.end
      );
    }

    if (filter?.userId) {
      events = events.filter(e => e.userId === filter.userId);
    }

    if (filter?.featureType && filter.featureType.length > 0) {
      events = events.filter(e => 
        filter.featureType!.some(type => e.eventType.includes(type))
      );
    }

    if (filter?.minSatisfaction) {
      events = events.filter(e => 
        e.metadata.satisfaction && e.metadata.satisfaction >= filter.minSatisfaction!
      );
    }

    return events;
  }

  private countByType(events: AnalyticsEvent[]): AIEmailMetrics['emailsByType'] {
    const types = ['compose', 'rewrite', 'reply', 'summarize', 'draft'] as const;
    const counts = types.reduce((acc, type) => {
      acc[type] = events.filter(e => e.eventType.includes(type)).length;
      return acc;
    }, {} as AIEmailMetrics['emailsByType']);

    return counts;
  }

  private calculateAverageContentLength(events: AnalyticsEvent[]): number {
    const lengths = events
      .map(e => e.metadata.contentLength)
      .filter(l => l !== undefined);
    
    return lengths.length > 0 ? 
      lengths.reduce((sum, l) => sum + l, 0) / lengths.length : 0;
  }

  private calculateContentLengthByType(events: AnalyticsEvent[]): AIEmailMetrics['contentLengthByType'] {
    const types = ['compose', 'rewrite', 'reply', 'summarize', 'draft'] as const;
    
    return types.reduce((acc, type) => {
      const typeEvents = events.filter(e => e.eventType.includes(type));
      acc[type] = this.calculateAverageContentLength(typeEvents);
      return acc;
    }, {} as AIEmailMetrics['contentLengthByType']);
  }

  private calculateAverageDuration(events: AnalyticsEvent[]): number {
    const durations = events
      .map(e => e.duration)
      .filter(d => d > 0);
    
    return durations.length > 0 ? 
      durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
  }

  private calculateDurationByType(events: AnalyticsEvent[]): AIEmailMetrics['generationTimeByType'] {
    const types = ['compose', 'rewrite', 'reply', 'summarize', 'draft'] as const;
    
    return types.reduce((acc, type) => {
      const typeEvents = events.filter(e => e.eventType.includes(type));
      acc[type] = this.calculateAverageDuration(typeEvents);
      return acc;
    }, {} as AIEmailMetrics['generationTimeByType']);
  }

  private calculateAverageSatisfaction(events: AnalyticsEvent[]): number {
    const ratings = events
      .map(e => e.metadata.satisfaction)
      .filter(r => r !== undefined);
    
    return ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
  }

  private calculateSatisfactionByType(events: AnalyticsEvent[]): AIEmailMetrics['satisfactionByType'] {
    const types = ['compose', 'rewrite', 'reply', 'summarize', 'draft'] as const;
    
    return types.reduce((acc, type) => {
      const typeEvents = events.filter(e => e.eventType.includes(type));
      acc[type] = this.calculateAverageSatisfaction(typeEvents);
      return acc;
    }, {} as AIEmailMetrics['satisfactionByType']);
  }

  private calculateTimeSaved(events: AnalyticsEvent[]): number {
    // Estimate time saved based on average typing speed and content length
    const avgTypingSpeed = 40; // words per minute
    const avgWordLength = 5; // characters per word
    
    return events.reduce((total, event) => {
      const contentLength = event.metadata.contentLength || 0;
      const wordsGenerated = contentLength / avgWordLength;
      const minutesSaved = wordsGenerated / avgTypingSpeed;
      return total + minutesSaved;
    }, 0);
  }

  private calculateAcceptanceRate(events: AnalyticsEvent[]): number {
    const decisionsCount = events.filter(e => 
      e.metadata.accepted !== undefined
    ).length;
    
    const acceptedCount = events.filter(e => 
      e.metadata.accepted === true
    ).length;
    
    return decisionsCount > 0 ? (acceptedCount / decisionsCount) * 100 : 0;
  }

  private calculateModificationRate(events: AnalyticsEvent[]): number {
    const acceptedCount = events.filter(e => 
      e.metadata.accepted === true
    ).length;
    
    const modifiedCount = events.filter(e => 
      e.metadata.accepted === true && e.metadata.modified === true
    ).length;
    
    return acceptedCount > 0 ? (modifiedCount / acceptedCount) * 100 : 0;
  }

  private calculatePeakUsageHours(events: AnalyticsEvent[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour]++;
    });
    
    // Get top 5 hours
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.hour);
  }

  private getMostUsedFeatures(events: AnalyticsEvent[]): string[] {
    const featureCounts = new Map<string, number>();
    
    events.forEach(event => {
      const feature = event.eventType.split('_')[0];
      featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
    });
    
    return Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([feature]) => feature);
  }

  private calculateSessionDuration(): number {
    return (Date.now() - this.sessionStartTime) / (1000 * 60); // in minutes
  }

  private calculateErrorRate(events: AnalyticsEvent[]): number {
    const errorCount = events.filter(e => e.eventType === 'error_occurred').length;
    return events.length > 0 ? (errorCount / events.length) * 100 : 0;
  }

  private countErrorsByType(events: AnalyticsEvent[]): Record<string, number> {
    const errors = events.filter(e => e.eventType === 'error_occurred');
    const errorCounts: Record<string, number> = {};
    
    errors.forEach(error => {
      const errorType = error.metadata.errorType || 'unknown';
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });
    
    return errorCounts;
  }

  private async getDailyTrends(filter?: AnalyticsFilter): Promise<AnalyticsChartData> {
    const days = 7;
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      const dayFilter: AnalyticsFilter = {
        ...filter,
        dateRange: { start: date, end: endDate }
      };
      
      const dayEvents = this.filterEvents(dayFilter);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(dayEvents.length);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Emails Generated',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    };
  }

  private async getWeeklyTrends(filter?: AnalyticsFilter): Promise<AnalyticsChartData> {
    // Similar implementation for weekly trends
    return this.getDailyTrends(filter); // Placeholder
  }

  private async getMonthlyTrends(filter?: AnalyticsFilter): Promise<AnalyticsChartData> {
    // Similar implementation for monthly trends
    return this.getDailyTrends(filter); // Placeholder
  }

  private exportAsCSV(metrics: AIEmailMetrics, options: AnalyticsExportOptions): Blob {
    const rows = [
      ['Metric', 'Value'],
      ['Total AI Generated Emails', metrics.totalAIGeneratedEmails.toString()],
      ['Average Content Length', metrics.averageContentLength.toString()],
      ['Average Generation Time (ms)', metrics.averageGenerationTime.toString()],
      ['User Satisfaction Rating', metrics.userSatisfactionRating.toString()],
      ['Time Saved (minutes)', metrics.timeSaved.toString()],
      ['Acceptance Rate (%)', metrics.acceptanceRate.toString()],
      ['Modification Rate (%)', metrics.modificationRate.toString()],
      ['Error Rate (%)', metrics.errorRate.toString()],
      '',
      ['Feature', 'Count'],
      ...Object.entries(metrics.emailsByType).map(([type, count]) => [type, count.toString()])
    ];
    
    const csv = rows.map(row => row.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }

  private exportAsPDF(summary: AnalyticsSummary, options: AnalyticsExportOptions): Blob {
    // In a real implementation, this would use a PDF library
    // For now, return a simple text representation
    const content = `
AI Email Analytics Report

Summary:
- Total Emails: ${summary.totalEmails}
- Time Saved: ${summary.timeSaved}
- Satisfaction Score: ${summary.satisfactionScore}/5
- Most Used Feature: ${summary.mostUsedFeature}
- Acceptance Rate: ${summary.acceptanceRate}
- Error Rate: ${summary.errorRate}
    `;
    
    return new Blob([content], { type: 'application/pdf' });
  }

  private exportAsJSON(data: any): Blob {
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // Get from auth context or storage
    return localStorage.getItem('userId') || 'anonymous';
  }

  private loadStoredEvents(): void {
    const stored = this.localStorage.getItem<AnalyticsEvent[]>(EVENTS_STORAGE_KEY);
    if (stored) {
      this.events = stored.map(e => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
    }
  }

  private saveEvents(): void {
    // Keep only last 30 days of events
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp >= thirtyDaysAgo);
    
    this.localStorage.setItem(EVENTS_STORAGE_KEY, this.events);
  }

  private startPeriodicFlush(): void {
    // Flush events to storage every 5 minutes
    setInterval(() => {
      this.saveEvents();
    }, 5 * 60 * 1000);
  }
}

// Export singleton instance
export const aiEmailAnalyticsService = AIEmailAnalyticsService.getInstance();