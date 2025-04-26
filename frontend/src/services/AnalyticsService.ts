/**
 * Analytics Service
 *
 * Provides functionality for secure analytics data collection, real-time metrics tracking,
 * data aggregation, and implementing data retention policies.
 */

import { securityManager } from '../security';
import { secureCache, CacheCategory } from '../utils/secureCaching';
import { UserAnalytics } from '../types/user';

// Define analytics data types
export interface AnalyticsDataPoint {
  timestamp: number;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

// Define authentication event types
export enum AuthEvent {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  MFA_ATTEMPT = 'mfa_attempt',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',
  BIOMETRIC_ATTEMPT = 'biometric_attempt',
  BIOMETRIC_SUCCESS = 'biometric_success',
  BIOMETRIC_FAILURE = 'biometric_failure',
  SESSION_TIMEOUT = 'session_timeout',
  TOKEN_REFRESH = 'token_refresh',
}

// Define security event types
export enum SecurityEvent {
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  PASSWORD_CHANGED = 'password_changed',
  DEVICE_VERIFICATION = 'device_verification',
  NEW_DEVICE_DETECTED = 'new_device_detected',
  LOCATION_CHANGE = 'location_change',
}

export interface AnalyticsAggregation {
  metric: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: number;
}

export interface RetentionPolicy {
  metricName: string;
  rawDataRetentionDays: number;
  aggregatedDataRetentionDays: number;
  highResolutionHours: number;
}

// Default retention policies
const DEFAULT_RETENTION_POLICIES: Record<string, RetentionPolicy> = {
  'email.sent': {
    metricName: 'email.sent',
    rawDataRetentionDays: 30,
    aggregatedDataRetentionDays: 365,
    highResolutionHours: 24,
  },
  'email.opened': {
    metricName: 'email.opened',
    rawDataRetentionDays: 30,
    aggregatedDataRetentionDays: 365,
    highResolutionHours: 24,
  },
  'email.replied': {
    metricName: 'email.replied',
    rawDataRetentionDays: 30,
    aggregatedDataRetentionDays: 365,
    highResolutionHours: 24,
  },
  'user.activity': {
    metricName: 'user.activity',
    rawDataRetentionDays: 7,
    aggregatedDataRetentionDays: 90,
    highResolutionHours: 48,
  },
  'system.performance': {
    metricName: 'system.performance',
    rawDataRetentionDays: 3,
    aggregatedDataRetentionDays: 30,
    highResolutionHours: 6,
  },
};

class AnalyticsService {
  private static instance: AnalyticsService;
  private dataPoints: AnalyticsDataPoint[] = [];
  private aggregations: Record<string, AnalyticsAggregation[]> = {};
  private retentionPolicies: Record<string, RetentionPolicy> = DEFAULT_RETENTION_POLICIES;
  private flushInterval: number = 60000; // 1 minute
  private intervalId: number | null = null;
  private onlineMode: boolean = navigator.onLine;
  private pendingOfflineData: AnalyticsDataPoint[] = [];
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private deviceInfo: any = this.collectDeviceInfo();
  private knownLocations: string[] = [];

  private constructor() {
    // Initialize online/offline detection
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);

    // Start the flush interval
    this.startFlushInterval();

    // Apply data retention on startup
    this.applyRetentionPolicies();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Set the current user ID for analytics
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Clear the user ID (on logout)
   */
  public clearUserId(): void {
    this.userId = null;
  }

  /**
   * Track an authentication event
   */
  public trackAuthEvent(event: AuthEvent, properties: any = {}): void {
    // Create tags from properties
    const tags = {
      ...properties,
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId,
    };

    // Track as a metric
    this.trackMetric(`auth.${event}`, 1, tags);

    // Check for suspicious activity
    if (event === AuthEvent.LOGIN_ATTEMPT || event === AuthEvent.LOGIN_FAILURE) {
      const isSuspicious = this.isSuspiciousLoginAttempt(properties);
      if (isSuspicious) {
        this.trackMetric(`security.${SecurityEvent.SUSPICIOUS_ACTIVITY}`, 1, tags);
      }
    }
  }

  /**
   * Track a security event
   */
  public trackSecurityEvent(event: SecurityEvent, properties: any = {}): void {
    // Create tags from properties
    const tags = {
      ...properties,
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId,
    };

    // Track as a metric
    this.trackMetric(`security.${event}`, 1, tags);
  }

  /**
   * Track a metric with the given value and optional tags
   * @param metric The metric name
   * @param value The metric value
   * @param tags Optional tags for the metric
   */
  public trackMetric(metric: string, value: number, tags?: Record<string, string>): void {
    // Create data point
    const dataPoint: AnalyticsDataPoint = {
      timestamp: Date.now(),
      metric,
      value,
      tags: tags ? securityManager.sanitizeObject(tags) : undefined,
    };

    // Store the data point
    this.dataPoints.push(dataPoint);

    // If offline, store in pending offline data
    if (!this.onlineMode) {
      this.pendingOfflineData.push(dataPoint);
      this.persistOfflineData();
    }

    // If we have too many data points, flush immediately
    if (this.dataPoints.length >= 100) {
      this.flushData();
    }
  }

  /**
   * Track page view analytics
   * @param pageName The name of the page being viewed
   * @param properties Optional properties for the page view
   */
  public trackPageView(pageName: string, properties: Record<string, any> = {}): void {
    // Create tags from properties
    const tags = {
      ...properties,
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId,
      page: pageName
    };

    // Track as a metric
    this.trackMetric('page.view', 1, tags);
  }

  /**
   * Get aggregated data for the given metric and period
   * @param metric The metric name
   * @param period The period to aggregate over
   * @param startTime The start time for the data
   * @param endTime The end time for the data
   */
  public async getAggregatedData(
    metric: string,
    period: 'hour' | 'day' | 'week' | 'month',
    startTime: number,
    endTime: number = Date.now()
  ): Promise<AnalyticsAggregation[]> {
    // Check cache first
    const cacheKey = `analytics_${metric}_${period}_${startTime}_${endTime}`;
    const cachedData = await this.getFromCache(cacheKey);

    if (cachedData) {
      return cachedData as AnalyticsAggregation[];
    }

    // In a real app, we would make an API call here
    // For now, return mock data or local aggregations
    let result: AnalyticsAggregation[] = this.aggregations[metric] || [];

    // Filter by time range
    result = result.filter(agg => agg.timestamp >= startTime && agg.timestamp <= endTime);

    // Cache the result
    await this.saveToCache(cacheKey, result);

    return result;
  }

  /**
   * Get real-time data for the given metric
   * @param metric The metric name
   * @param limit The maximum number of data points to return
   */
  public async getRealTimeData(metric: string, limit: number = 100): Promise<AnalyticsDataPoint[]> {
    // In a real app, this would subscribe to a WebSocket
    // For now, return most recent data points for the metric
    return this.dataPoints
      .filter(dp => dp.metric === metric)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Set a custom retention policy for a metric
   * @param policy The retention policy to set
   */
  public setRetentionPolicy(policy: RetentionPolicy): void {
    this.retentionPolicies[policy.metricName] = policy;
    // Apply the retention policy immediately
    this.applyRetentionPolicy(policy);
  }

  /**
   * Get the current retention policy for a metric
   * @param metricName The metric name
   */
  public getRetentionPolicy(metricName: string): RetentionPolicy | undefined {
    return this.retentionPolicies[metricName];
  }

  /**
   * Get user analytics data
   */
  public async getUserAnalytics(): Promise<UserAnalytics> {
    // In a real app, this would come from an API
    // For now, return mock data
    return {
      emailsSent: 145,
      emailsReceived: 278,
      responseTime: 124,
      activeHours: [9, 10, 11, 14, 15, 16],
      mostActiveDay: 'Tuesday',
      aiUsage: {
        draftsGenerated: 42,
        responsesUsed: 37,
        tokensConsumed: 15023,
        suggestionsAccepted: 29,
        suggestionsRejected: 8
      }
    };
  }

  // Private methods

  /**
   * Flush data to the server
   */
  private async flushData(): Promise<void> {
    if (this.dataPoints.length === 0) return;

    // Copy and clear the data points
    const dataToSend = [...this.dataPoints];
    this.dataPoints = [];

    try {
      // In a real app, we would send the data to an API
      // For now, just log it and update local aggregations
      console.log('Flushing analytics data:', dataToSend.length, 'data points');

      // Perform local aggregation
      this.aggregateData(dataToSend);

      // Apply retention policies
      this.applyRetentionPolicies();
    } catch (error) {
      // If there's an error, put the data back
      this.dataPoints = [...dataToSend, ...this.dataPoints];
      console.error('Failed to flush analytics data:', error);
    }
  }

  /**
   * Aggregate data points into time-based buckets
   * @param dataPoints The data points to aggregate
   */
  private aggregateData(dataPoints: AnalyticsDataPoint[]): void {
    // Group by metric
    const metricGroups = dataPoints.reduce((groups, point) => {
      if (!groups[point.metric]) {
        groups[point.metric] = [];
      }
      groups[point.metric].push(point);
      return groups;
    }, {} as Record<string, AnalyticsDataPoint[]>);

    // Aggregate each metric group
    Object.entries(metricGroups).forEach(([metric, points]) => {
      // Get hourly timestamps
      const hourlyTimestamps = points.map(p => this.roundToHour(p.timestamp));
      const uniqueHours = [...new Set(hourlyTimestamps)];

      // Create hourly aggregations
      const hourlyAggregations = uniqueHours.map(hour => {
        const hourPoints = points.filter(p => this.roundToHour(p.timestamp) === hour);
        const values = hourPoints.map(p => p.value);

        return {
          metric,
          period: 'hour' as const,
          timestamp: hour,
          count: hourPoints.length,
          sum: values.reduce((sum, val) => sum + val, 0),
          avg: values.reduce((sum, val) => sum + val, 0) / hourPoints.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      });

      // Store the aggregations
      if (!this.aggregations[metric]) {
        this.aggregations[metric] = [];
      }

      // Merge with existing aggregations, replacing any for the same hour
      const existingHours = new Set(this.aggregations[metric].map(agg => agg.timestamp));

      // Add new aggregations
      hourlyAggregations.forEach(agg => {
        if (existingHours.has(agg.timestamp)) {
          // Replace existing
          const index = this.aggregations[metric].findIndex(a => a.timestamp === agg.timestamp);
          this.aggregations[metric][index] = agg;
        } else {
          // Add new
          this.aggregations[metric].push(agg);
        }
      });
    });
  }

  /**
   * Round a timestamp to the nearest hour
   * @param timestamp The timestamp to round
   */
  private roundToHour(timestamp: number): number {
    const date = new Date(timestamp);
    date.setMinutes(0, 0, 0);
    return date.getTime();
  }

  /**
   * Apply all retention policies
   */
  private applyRetentionPolicies(): void {
    Object.values(this.retentionPolicies).forEach(policy => {
      this.applyRetentionPolicy(policy);
    });
  }

  /**
   * Apply a specific retention policy
   * @param policy The retention policy to apply
   */
  private applyRetentionPolicy(policy: RetentionPolicy): void {
    const now = Date.now();

    // Apply to raw data
    const rawCutoff = now - (policy.rawDataRetentionDays * 24 * 60 * 60 * 1000);
    this.dataPoints = this.dataPoints.filter(
      dp => dp.metric !== policy.metricName || dp.timestamp >= rawCutoff
    );

    // Apply to aggregated data
    if (this.aggregations[policy.metricName]) {
      const aggCutoff = now - (policy.aggregatedDataRetentionDays * 24 * 60 * 60 * 1000);
      this.aggregations[policy.metricName] = this.aggregations[policy.metricName].filter(
        agg => agg.timestamp >= aggCutoff
      );
    }
  }

  /**
   * Start the interval to periodically flush data
   */
  private startFlushInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => this.flushData(), this.flushInterval);
  }

  /**
   * Handle online/offline status changes
   */
  private handleOnlineStatus = (): void => {
    const wasOffline = !this.onlineMode;
    this.onlineMode = navigator.onLine;

    // If we've come back online and have pending offline data, sync it
    if (this.onlineMode && wasOffline && this.pendingOfflineData.length > 0) {
      this.syncOfflineData();
    }
  };

  /**
   * Persist offline data to local storage
   */
  private persistOfflineData(): void {
    try {
      localStorage.setItem(
        'analytics_offline_data',
        JSON.stringify(this.pendingOfflineData)
      );
    } catch (error) {
      console.error('Failed to persist offline analytics data:', error);
    }
  }

  /**
   * Sync offline data when coming back online
   */
  private syncOfflineData(): void {
    // Add the pending data back to the main queue
    this.dataPoints.push(...this.pendingOfflineData);

    // Clear the pending data
    this.pendingOfflineData = [];
    localStorage.removeItem('analytics_offline_data');

    // Flush immediately
    this.flushData();
  }

  /**
   * Save data to secure cache
   */
  private async saveToCache(key: string, data: any): Promise<void> {
    await secureCache(key, data, CacheCategory.SENSITIVE, 3600); // 1 hour cache
  }

  /**
   * Get data from secure cache
   */
  private async getFromCache(key: string): Promise<any | null> {
    // This would use the secure cache utility
    // For simplicity, we're using localStorage directly
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Collect basic device information
   */
  private collectDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: window.screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    };
  }

  /**
   * Check if a login attempt is suspicious
   */
  public isSuspiciousLoginAttempt(properties: any): boolean {
    // Implement logic to detect suspicious login attempts
    // This could include checking for:
    // - Multiple failed attempts
    // - Unusual locations
    // - Unusual devices
    // - Unusual times

    // For now, return a simple implementation
    const currentLocation = properties.location;

    if (currentLocation && this.knownLocations.length > 0) {
      return !this.knownLocations.includes(currentLocation);
    }

    return false;
  }

  /**
   * Add a known location for the current user
   */
  public addKnownLocation(location: string): void {
    if (!this.knownLocations.includes(location)) {
      this.knownLocations.push(location);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.flushData();
  }
}

// Create and export a proper singleton instance
const analyticsServiceInstance = AnalyticsService.getInstance();
export { analyticsServiceInstance as analyticsService };