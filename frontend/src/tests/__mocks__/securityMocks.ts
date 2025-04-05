/**
 * Mock implementations for security-related classes to use in tests
 */

// Mock for RateLimiter that doesn't use browser-specific APIs
export class MockRateLimiter {
  private readonly options: any;
  private readonly store: Map<string, any> = new Map();

  constructor(options: any) {
    this.options = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      skipSuccessfulRequests: false,
      ...options
    };
  }

  public check(identifier: string): {
    limited: boolean;
    remaining: number;
    resetAt: number;
    current: number;
  } {
    return {
      limited: false,
      remaining: 100,
      resetAt: Date.now() + 60000,
      current: 0
    };
  }

  public reset(): void {}

  public getInfo(): any {
    return {
      remaining: 100,
      resetAt: Date.now() + 60000,
      current: 0
    };
  }

  public destroy(): void {}
}

// Mock for AuditLogger that doesn't use browser-specific APIs
export class MockAuditLogger {
  private logs: any[] = [];

  constructor() {}

  public log(event: any): void {
    this.logs.push({
      timestamp: Date.now(),
      ...event
    });
  }

  public getEvents(): any[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Mock for KeyVault that doesn't use browser-specific APIs
export class MockKeyVault {
  private keys: Map<string, string> = new Map();

  constructor() {}

  public getKey(name: string): string {
    return this.keys.get(name) || '';
  }

  public storeKey(name: string, value: string): void {
    this.keys.set(name, value);
  }

  public rotateKey(name: string, newValue: string): string | null {
    const oldValue = this.keys.get(name) || null;
    this.keys.set(name, newValue);
    return oldValue;
  }

  public hasValidKey(name: string): boolean {
    return this.keys.has(name);
  }

  public loadKeys(): void {}
}

// Mock for SecurityManager
export const mockSecurityManager = {
  sanitizeObject: (data: any) => data,
  validateEmail: () => true,
  validateSafeString: () => true,
  checkRateLimit: () => true,
  getApiKey: () => Promise.resolve('mock-api-key')
};