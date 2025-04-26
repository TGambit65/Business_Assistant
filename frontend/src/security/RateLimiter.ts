/**
 * Rate limiter to prevent abuse of API resources
 * Implements token bucket algorithm for flexible rate limiting
 */

export interface RateLimiterOptions {
  windowMs: number;       // Time window in milliseconds
  max: number;            // Maximum requests allowed in the window
  message?: string;       // Custom error message
  statusCode?: number;    // HTTP status code for rate limit errors
  skipSuccessfulRequests?: boolean; // Whether to count successful requests
}

interface RateLimitRecord {
  count: number;          // Number of requests made
  resetAt: number;        // Timestamp when the window resets
  lastRequest: number;    // Timestamp of the last request
}

export class RateLimiter {
  private readonly options: RateLimiterOptions;
  private readonly store: Map<string, RateLimitRecord> = new Map();
  private readonly cleanupInterval: ReturnType<typeof setInterval> | number;
  
  constructor(options: RateLimiterOptions) {
    this.options = {
      message: 'Too many requests, please try again later',
      statusCode: 429,            // Too Many Requests
      skipSuccessfulRequests: false,
      ...options
    };
    
    // Set up periodic cleanup of old records
    // Check for global window object to ensure compatibility with Node.js tests
    const globalObj = typeof window !== 'undefined' ? window : global;
    this.cleanupInterval = typeof setInterval !== 'undefined' ?
      globalObj.setInterval(() => this.cleanup(), this.options.windowMs) : 0;
  }
  
  /**
   * Check if a request should be rate limited
   * @param identifier Unique identifier for the requester (IP, user ID, etc.)
   * @param increment Whether to increment the counter (default: true)
   * @returns Object containing rate limit information
   */
  public check(identifier: string, increment = true): {
    limited: boolean;
    remaining: number;
    resetAt: number;
    current: number;
  } {
    const now = Date.now();
    
    // Get or create rate limit record
    let record = this.store.get(identifier);
    
    // If no record exists or the window has expired, create a new one
    if (!record || now > record.resetAt) {
      record = {
        count: 0,
        resetAt: now + this.options.windowMs,
        lastRequest: now
      };
      this.store.set(identifier, record);
    }
    
    // Calculate remaining requests
    const remaining = Math.max(0, this.options.max - record.count);
    
    // Check if rate limited
    const limited = record.count >= this.options.max;
    
    // If not limited and increment is requested, increase the counter
    if (!limited && increment) {
      record.count += 1;
      record.lastRequest = now;
    }
    
    return {
      limited,
      remaining,
      resetAt: record.resetAt,
      current: record.count
    };
  }
  
  /**
   * Reset rate limit for a specific identifier
   * @param identifier The identifier to reset
   */
  public reset(identifier: string): void {
    this.store.delete(identifier);
  }
  
  /**
   * Get current rate limit information without incrementing
   * @param identifier The identifier to check
   */
  public getInfo(identifier: string): {
    remaining: number;
    resetAt: number;
    current: number;
  } | null {
    const record = this.store.get(identifier);
    
    if (!record) {
      return null;
    }
    
    return {
      remaining: Math.max(0, this.options.max - record.count),
      resetAt: record.resetAt,
      current: record.count
    };
  }
  
  /**
   * Clean up expired rate limit records
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Remove any records that have expired
    // Using Array.from to avoid issues with ES2015 iteration in older environments
    Array.from(this.store.keys()).forEach(identifier => {
      const record = this.store.get(identifier);
      if (record && now > record.resetAt) {
        this.store.delete(identifier);
      }
    });
  }
  
  /**
   * Destroy the rate limiter and clear any timers
   */
  public destroy(): void {
    if (this.cleanupInterval && typeof clearInterval !== 'undefined') {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
} 