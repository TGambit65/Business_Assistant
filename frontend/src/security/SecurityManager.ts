/**
 * SecurityManager class
 * 
 * Provides centralized security functionality including:
 * - Secure API key storage and rotation
 * - Input sanitization to prevent XSS and injection attacks
 * - Rate limiting to prevent abuse
 * - Request validation and CORS configuration
 * - Audit logging for security events
 * - End-to-end encryption
 * - Security audit
 * - Compliance enforcement
 */

import { KeyVault } from './KeyVault';
import { RateLimiter, RateLimiterOptions } from './RateLimiter';
import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import { ComplianceManager } from './ComplianceManager';
import { TwoFactorAuth } from './TwoFactorAuth';
import { MobileSecurity } from './MobileSecurity';
import { SecurityTesting } from './SecurityTesting';
import { 
  SecurityConfig, 
  EncryptionConfig, 
  MonitoringConfig,
  ComplianceRule,
  EncryptedData,
  AuditResult,
  AuditFinding,
  SecurityTestResult
} from '../types/security';
import { AuthConfig } from '../types/auth';

// Define allowed domains for CORS
const ALLOWED_ORIGINS = [
  'https://email-assistant.example.com',
  'https://app.email-assistant.example.com',
  'http://localhost:3000'
];

// Regex patterns for input validation
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  safeString: /^[a-zA-Z0-9\s.,!?()_\-+@#$%^&*=[\]{}|;:'"`~<>/\\]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

export interface Request {
  headers: Record<string, string>;
  url: string;
  method: string;
  origin?: string;
  body?: any;
  ip?: string;
  query?: Record<string, string>;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private readonly keyVault: KeyVault;
  private readonly rateLimit: RateLimiter;
  private readonly auditLogger: AuditLogger;
  private readonly encryption: AnalyticsEncryption;
  private readonly complianceManager: ComplianceManager;
  private readonly twoFactorAuth: TwoFactorAuth;
  private readonly mobileSecurity: MobileSecurity;
  private readonly securityTesting: SecurityTesting;
  private securityConfig: SecurityConfig;

  private constructor() {
    this.keyVault = new KeyVault();
    this.rateLimit = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    });
    this.auditLogger = new AuditLogger({
      enableConsoleLogging: true,
      enableRemoteLogging: process.env.NODE_ENV === 'production'
    });
    this.encryption = AnalyticsEncryption.getInstance();
    this.complianceManager = ComplianceManager.getInstance();
    this.twoFactorAuth = TwoFactorAuth.getInstance();
    this.mobileSecurity = MobileSecurity.getInstance();
    this.securityTesting = SecurityTesting.getInstance();
    
    // Initialize with default API keys if needed
    this.initializeDefaultKeys();
    
    // Initialize security configuration
    this.securityConfig = {
      encryption: this.getDefaultEncryptionConfig(),
      authentication: this.getDefaultAuthConfig(),
      compliance: [],
      monitoring: this.getDefaultMonitoringConfig(),
      version: '1.0.0'
    };
    
    // Load compliance rules
    this.securityConfig.compliance = this.complianceManager.getRules();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Get a stored API key
   * @param keyName Name of the API key to retrieve
   * @returns Promise resolving to the API key or null if not found
   */
  public async getApiKey(keyName: string): Promise<string> {
    const key = this.keyVault.getKey(keyName);
    
    if (!key) {
      this.auditLogger.log({
        type: EventType.API_KEY_ROTATION,
        level: LogLevel.WARNING,
        description: `Failed to retrieve API key: ${keyName}`,
      });
      
      throw new Error(`API key ${keyName} not found or expired`);
    }
    
    this.auditLogger.log({
      type: EventType.DATA_ACCESS,
      level: LogLevel.INFO,
      description: `API key ${keyName} was accessed`,
    });
    
    return key;
  }

  /**
   * Store a new API key
   * @param keyName Name of the key
   * @param keyValue The API key value
   * @param expiryDays Number of days until expiry
   */
  public storeApiKey(keyName: string, keyValue: string, expiryDays = 30): void {
    this.keyVault.storeKey(keyName, keyValue, expiryDays);
    
    this.auditLogger.log({
      type: EventType.API_KEY_ROTATION,
      level: LogLevel.INFO,
      description: `API key ${keyName} was stored with ${expiryDays} days expiry`,
    });
  }

  /**
   * Rotate an API key with a new value
   * @param keyName Name of the key to rotate
   * @param newKeyValue New API key value
   * @param expiryDays Days until the new key expires
   */
  public rotateApiKey(keyName: string, newKeyValue: string, expiryDays = 30): string | null {
    const oldKey = this.keyVault.rotateKey(keyName, newKeyValue, expiryDays);
    
    this.auditLogger.log({
      type: EventType.API_KEY_ROTATION,
      level: LogLevel.INFO,
      description: `API key ${keyName} was rotated with ${expiryDays} days expiry`,
    });
    
    return oldKey;
  }

  /**
   * Sanitize input to prevent XSS and injection attacks
   * @param input The input string to sanitize
   * @returns Sanitized string
   */
  public sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Basic sanitization: replace potentially dangerous characters
    const sanitized = input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;');
    
    return sanitized;
  }

  /**
   * Sanitize an object recursively
   * @param obj The object to sanitize
   * @returns Sanitized object
   */
  public sanitizeObject<T>(obj: T): T {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj) as unknown as T;
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as unknown as T;
    }
    
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      sanitized[key] = this.sanitizeObject(value);
    }
    
    return sanitized as T;
  }

  /**
   * Validate an email address
   * @param email The email to validate
   */
  public validateEmail(email: string): boolean {
    return PATTERNS.email.test(email);
  }

  /**
   * Validate that a string contains only safe characters
   * @param input The string to validate
   */
  public validateSafeString(input: string): boolean {
    return PATTERNS.safeString.test(input);
  }

  /**
   * Check if a request exceeds rate limits
   * @param identifier Unique identifier for the requester
   * @returns true if rate limit is not exceeded, false otherwise
   */
  public checkRateLimit(identifier: string): boolean {
    const result = this.rateLimit.check(identifier);
    
    if (result.limited) {
      this.auditLogger.log({
        type: EventType.RATE_LIMIT_EXCEEDED,
        level: LogLevel.WARNING,
        description: `Rate limit exceeded for ${identifier}`,
        metadata: {
          current: result.current,
          limit: (this.rateLimit as any).options.max,
          resetAt: new Date(result.resetAt).toISOString()
        }
      });
    }
    
    return !result.limited;
  }

  /**
   * Get rate limit information without incrementing
   * @param identifier The identifier to check
   */
  public getRateLimitInfo(identifier: string): {
    remaining: number;
    resetAt: number;
    current: number;
  } | null {
    return this.rateLimit.getInfo(identifier);
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier The identifier to reset
   */
  public resetRateLimit(identifier: string): void {
    this.rateLimit.reset(identifier);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `Rate limit reset for ${identifier}`,
    });
  }

  /**
   * Validate a request for security concerns
   * @param req The request to validate
   * @returns true if request is valid, false otherwise
   */
  public validateRequest(req: Request): boolean {
    // 1. Check CORS
    if (req.origin && !this.isOriginAllowed(req.origin)) {
      this.auditLogger.log({
        type: EventType.SUSPICIOUS_ACTIVITY,
        level: LogLevel.WARNING,
        description: `Invalid origin in request: ${req.origin}`,
        metadata: { url: req.url, method: req.method }
      });
      return false;
    }
    
    // 2. Check for required headers
    if (req.method !== 'GET' && !req.headers['content-type']) {
      this.auditLogger.log({
        type: EventType.SUSPICIOUS_ACTIVITY,
        level: LogLevel.WARNING,
        description: 'Missing Content-Type header',
        metadata: { url: req.url, method: req.method }
      });
      return false;
    }
    
    // 3. Validate content type for non-GET requests
    if (
      req.method !== 'GET' && 
      req.body && 
      !req.headers['content-type']?.includes('application/json')
    ) {
      this.auditLogger.log({
        type: EventType.SUSPICIOUS_ACTIVITY,
        level: LogLevel.WARNING,
        description: 'Invalid Content-Type, expected application/json',
        metadata: { 
          url: req.url, 
          method: req.method,
          contentType: req.headers['content-type']
        }
      });
      return false;
    }
    
    return true;
  }

  /**
   * Check if an origin is allowed by CORS policy
   * @param origin The origin to check
   */
  public isOriginAllowed(origin: string): boolean {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    return ALLOWED_ORIGINS.includes(origin);
  }

  /**
   * Get CORS headers for a request
   * @param origin The origin of the request
   */
  public getCorsHeaders(origin: string): Record<string, string> {
    if (!this.isOriginAllowed(origin)) {
      return {};
    }
    
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }

  /**
   * Configure rate limiting options
   * @param options Rate limiter options
   */
  public configureRateLimits(options: Partial<RateLimiterOptions>): void {
    // Create a new rate limiter with the updated options
    this.rateLimit.destroy();
    
    // Ensure required options have values
    const completeOptions: RateLimiterOptions = {
      windowMs: options.windowMs ?? 60 * 1000,
      max: options.max ?? 100,
      ...(options)
    };
    
    (this as any).rateLimit = new RateLimiter(completeOptions);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: 'Rate limiter configuration updated',
      metadata: options
    });
  }
  
  /**
   * Initialize default API keys if environment variables are available
   */
  private initializeDefaultKeys(): void {
    // Initialize API keys from environment variables if available
    if (typeof process !== 'undefined' && process.env) {
      const envKeys = [
        { name: 'deepseekKey', envVar: 'REACT_APP_DEEPSEEK_API_KEY' },
        { name: 'openaiKey', envVar: 'REACT_APP_OPENAI_API_KEY' },
        { name: 'authKey', envVar: 'REACT_APP_AUTH_API_KEY' }
      ];
      
      for (const { name, envVar } of envKeys) {
        const keyValue = process.env[envVar];
        if (keyValue && !this.keyVault.hasValidKey(name)) {
          this.keyVault.storeKey(name, keyValue);
          
          this.auditLogger.log({
            type: EventType.CONFIGURATION_CHANGE,
            level: LogLevel.INFO,
            description: `Default API key '${name}' initialized from environment variable`,
          });
        }
      }
    }
  }

  /**
   * Encrypt sensitive data with enhanced security
   * @param data The data to encrypt
   * @returns Promise resolving to the encrypted data
   */
  public async encryptSensitiveData(data: any): Promise<EncryptedData> {
    try {
      // Log the encryption operation
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.INFO,
        description: 'Encrypting sensitive data',
      });
      
      // Determine if this is a sensitive field that should have additional protection
      // let requiresBiometrics = false; // Restore variable declaration
      
      if (typeof data === 'object' && data !== null) {
        // const sensitiveFields = this.mobileSecurity.getSecureStorageConfig().sensitiveFields;
        // const hasAnyFields = Object.keys(data).some(key => sensitiveFields.includes(key)); // Comment out assignment as requiresBiometrics is unused
        // requiresBiometrics = hasAnyFields; // Comment out assignment as requiresBiometrics is unused
      }
      
      // Use analytics encryption implementation for now
      // Cast the result to our EncryptedData type with additional fields
      const encryptedFromAnalytics = this.encryption.encrypt(data);
      
      // Add missing properties required by our EncryptedData type
      const encrypted: EncryptedData = {
        ...encryptedFromAnalytics,
        algorithm: 'AES-GCM', // Default algorithm used by AnalyticsEncryption
        keyId: undefined      // No key ID in AnalyticsEncryption
      };
      
      return encrypted;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Encryption failed: ${(error as Error).message}`,
      });
      
      throw new Error(`Failed to encrypt sensitive data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Decrypt sensitive data
   * @param encryptedData The encrypted data
   * @returns The decrypted data
   */
  public async decryptSensitiveData(encryptedData: EncryptedData): Promise<any> {
    try {
      // Log the decryption operation
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.INFO,
        description: 'Decrypting sensitive data',
      });
      
      // Use analytics encryption implementation for now
      // We need to convert our EncryptedData to AnalyticsEncryption's EncryptedData format
      const analyticsEncryptedData = {
        data: encryptedData.data,
        iv: encryptedData.iv,
        timestamp: encryptedData.timestamp,
        version: '1.0.0' // Default version used by AnalyticsEncryption
      };
      
      const decrypted = this.encryption.decrypt(analyticsEncryptedData);
      
      return decrypted;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Decryption failed: ${(error as Error).message}`,
      });
      
      throw new Error(`Failed to decrypt sensitive data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Perform a comprehensive security audit
   * @returns Promise resolving to the audit result
   */
  public async performSecurityAudit(): Promise<AuditResult> {
    try {
      // Start time for measuring duration
      const startTime = Date.now();
      
      // Log the audit operation
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: 'Starting security audit',
      });
      
      // Run all security tests
      const testResults = await this.securityTesting.runAllTests();
      
      // Collect findings from test results
      const findings: AuditFinding[] = [];
      
      // Generate findings based on test results
      testResults.forEach(test => {
        if (!test.passed) {
          findings.push({
            id: `finding-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: `${test.name} Test Failed`,
            description: test.details || 'Security test failed with no details',
            severity: test.name.includes('XSS') || test.name.includes('CSRF') ? 'high' : 'medium',
            category: test.name,
            remediation: `Review and fix the ${test.name} implementation`
          });
        }
      });
      
      // Categorize vulnerabilities by severity
      const vulnerabilities = {
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length,
      };
      
      // Calculate overall security score (0-100)
      const maxScore = 100;
      const deductionsPerSeverity = {
        critical: 20,
        high: 10,
        medium: 5,
        low: 2
      };
      
      const totalDeductions = 
        vulnerabilities.critical * deductionsPerSeverity.critical +
        vulnerabilities.high * deductionsPerSeverity.high +
        vulnerabilities.medium * deductionsPerSeverity.medium +
        vulnerabilities.low * deductionsPerSeverity.low;
      
      const score = Math.max(0, maxScore - totalDeductions);
      
      // Generate recommendations based on findings
      const recommendations = this.generateSecurityRecommendations(findings);
      
      // Create summary text
      const summary = this.generateSecuritySummary(score, vulnerabilities, testResults);
      
      // Create the final audit result
      const auditResult: AuditResult = {
        timestamp: Date.now(),
        score,
        findings,
        summary,
        recommendations,
        vulnerabilities
      };
      
      // Log the completion of the audit
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: score < 70 ? LogLevel.WARNING : LogLevel.INFO,
        description: `Security audit completed with score: ${score}/100`,
        metadata: {
          vulnerabilities,
          durationMs: Date.now() - startTime
        }
      });
      
      return auditResult;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.ERROR,
        description: `Security audit failed: ${(error as Error).message}`,
      });
      
      throw new Error(`Failed to perform security audit: ${(error as Error).message}`);
    }
  }
  
  /**
   * Enforce compliance rules
   * @param rules Compliance rules to enforce
   */
  public async enforceCompliance(rules: ComplianceRule[]): Promise<void> {
    try {
      // Log the compliance enforcement operation
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Enforcing ${rules.length} compliance rules`,
      });
      
      // For each rule in the input, add or update it in the compliance manager
      for (const rule of rules) {
        // If the rule already exists, update it
        if (this.complianceManager.getRules().some(r => r.id === rule.id)) {
          this.complianceManager.updateRule(rule);
        } else {
          // Otherwise, add the new rule
          this.complianceManager.addRule(rule);
        }
        
        // Ensure the rule is enforced
        this.complianceManager.enforceRule(rule.id, rule.enforced);
      }
      
      // Update the security configuration
      this.securityConfig.compliance = this.complianceManager.getRules();
      
      // Validate enforcement by checking a sample of rules
      const sampleRules = rules.slice(0, Math.min(rules.length, 3));
      const sampleData = { userConsent: true, id: 'sample', name: 'Sample User' };
      
      for (const rule of sampleRules) {
        const validationResult = this.complianceManager.validateRule(rule.id, sampleData);
        
        // Log the validation result for each sample rule
        this.auditLogger.log({
          type: EventType.CONFIGURATION_CHANGE,
          level: validationResult.compliant ? LogLevel.INFO : LogLevel.WARNING,
          description: `Compliance rule "${rule.name}" validation: ${validationResult.compliant ? 'PASSED' : 'FAILED'}`,
          metadata: { 
            ruleId: rule.id, 
            standard: rule.standard,
            details: validationResult.details 
          }
        });
      }
    } catch (error) {
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.ERROR,
        description: `Compliance enforcement failed: ${(error as Error).message}`,
      });
      
      throw new Error(`Failed to enforce compliance rules: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get the security configuration
   */
  public getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }
  
  /**
   * Update the security configuration
   * @param config Updated security configuration
   */
  public updateSecurityConfig(config: Partial<SecurityConfig>): void {
    // Update only the provided fields
    if (config.encryption) {
      this.securityConfig.encryption = {
        ...this.securityConfig.encryption,
        ...config.encryption
      };
    }
    
    if (config.authentication) {
      this.securityConfig.authentication = {
        ...this.securityConfig.authentication,
        ...config.authentication
      };
    }
    
    if (config.monitoring) {
      this.securityConfig.monitoring = {
        ...this.securityConfig.monitoring,
        ...config.monitoring
      };
    }
    
    if (config.twoFactor) {
      this.securityConfig.twoFactor = {
        ...this.securityConfig.twoFactor,
        ...config.twoFactor
      };
    }
    
    if (config.secureStorage) {
      this.securityConfig.secureStorage = {
        ...this.securityConfig.secureStorage,
        ...config.secureStorage
      };
      
      // Update the mobile security configuration as well
      this.mobileSecurity.updateSecureStorageConfig(config.secureStorage);
    }
    
    if (config.deviceVerification) {
      this.securityConfig.deviceVerification = {
        ...this.securityConfig.deviceVerification,
        ...config.deviceVerification
      };
      
      // Update the device verification configuration as well
      this.mobileSecurity.updateDeviceVerificationConfig(config.deviceVerification);
    }
    
    // If compliance rules are provided, enforce them
    if (config.compliance && config.compliance.length > 0) {
      this.enforceCompliance(config.compliance)
        .catch(error => {
          this.auditLogger.log({
            type: EventType.CONFIGURATION_CHANGE,
            level: LogLevel.ERROR,
            description: `Failed to update compliance rules: ${error.message}`,
          });
        });
    }
    
    // Update version if provided
    if (config.version) {
      this.securityConfig.version = config.version;
    }
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: 'Security configuration updated',
      metadata: {
        updates: Object.keys(config)
      }
    });
  }
  
  /**
   * Get default encryption configuration
   */
  private getDefaultEncryptionConfig(): EncryptionConfig {
    return {
      algorithm: 'AES-GCM',
      keySize: 256,
      useHardwareEncryption: false,
      storageStrategy: 'localStorage',
      autoEncryptFields: ['password', 'creditCard', 'ssn', 'apiKey'],
      ivStrategy: 'random'
    };
  }
  
  /**
   * Get default authentication configuration
   */
  private getDefaultAuthConfig(): AuthConfig {
    return {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID,
      githubClientId: process.env.GITHUB_CLIENT_ID,
      apiUrl: process.env.API_URL,
      authStorageKey: 'auth_storage',
      tokenRefreshThreshold: 300, // 5 minutes
      maxRetryAttempts: 3,
      autoRefreshToken: true
    };
  }
  
  /**
   * Get default monitoring configuration
   */
  private getDefaultMonitoringConfig(): MonitoringConfig {
    return {
      logLevel: 'info',
      remoteLogging: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.LOG_ENDPOINT,
      logRotationDays: 30,
      alertThresholds: {
        failedLogins: 5,
        apiRateLimitExceeded: 10,
        suspiciousActivities: 3
      },
      realTimeAlerts: process.env.NODE_ENV === 'production'
    };
  }
  
  /**
   * Generate security recommendations based on findings
   */
  private generateSecurityRecommendations(findings: AuditFinding[]): string[] {
    const recommendations: string[] = [];
    
    // Add general recommendations
    if (findings.length === 0) {
      recommendations.push('Continue with regular security audits');
      recommendations.push('Stay updated with the latest security patches');
      return recommendations;
    }
    
    // Add recommendations based on critical and high severity findings
    const criticalAndHighFindings = findings.filter(f => 
      f.severity === 'critical' || f.severity === 'high'
    );
    
    if (criticalAndHighFindings.length > 0) {
      recommendations.push('Prioritize addressing critical and high severity findings immediately');
      
      criticalAndHighFindings.forEach(finding => {
        recommendations.push(`Fix ${finding.title}: ${finding.remediation}`);
      });
    }
    
    // Add category-specific recommendations
    const categories = new Set(findings.map(f => f.category));
    
    if (categories.has('XSS Protection')) {
      recommendations.push('Improve input validation and output encoding to prevent XSS attacks');
    }
    
    if (categories.has('CSRF Protection')) {
      recommendations.push('Implement anti-CSRF tokens for all state-changing operations');
    }
    
    if (categories.has('Secure Storage')) {
      recommendations.push('Review encryption implementation and key management practices');
    }
    
    if (categories.has('Compliance Rules')) {
      recommendations.push('Review and update compliance policy to meet regulatory requirements');
    }
    
    return recommendations;
  }
  
  /**
   * Generate security summary text
   */
  private generateSecuritySummary(
    score: number, 
    vulnerabilities: { critical: number; high: number; medium: number; low: number; },
    testResults: SecurityTestResult[]
  ): string {
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const passRate = Math.round((passedTests / totalTests) * 100);
    
    const totalVulnerabilities = 
      vulnerabilities.critical + 
      vulnerabilities.high + 
      vulnerabilities.medium + 
      vulnerabilities.low;
    
    let riskLevel = 'Low';
    if (vulnerabilities.critical > 0 || vulnerabilities.high > 2) {
      riskLevel = 'High';
    } else if (vulnerabilities.high > 0 || vulnerabilities.medium > 3) {
      riskLevel = 'Medium';
    }
    
    return `Security audit completed with an overall score of ${score}/100. ` +
      `${passedTests} out of ${totalTests} security tests passed (${passRate}%). ` +
      `${totalVulnerabilities} vulnerabilities were identified ` +
      `(${vulnerabilities.critical} critical, ${vulnerabilities.high} high, ` +
      `${vulnerabilities.medium} medium, ${vulnerabilities.low} low). ` +
      `Overall risk level: ${riskLevel}.`;
  }
} 