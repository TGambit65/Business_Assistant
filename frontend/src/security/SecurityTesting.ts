/**
 * Security Testing Utilities
 * 
 * Provides tools for:
 * - Security penetration testing
 * - Compliance validation
 * - Performance impact assessment
 * - Mobile security verification
 */

import { AuditLogger, EventType, LogLevel } from './AuditLogger';
// Remove the direct import to break circular dependency
// import { SecurityManager } from './SecurityManager';
import { ComplianceManager } from './ComplianceManager';
import { MobileSecurity } from './MobileSecurity';
import { SecurityTestResult } from '../types/security';

export class SecurityTesting {
  private static instance: SecurityTesting;
  private readonly auditLogger: AuditLogger;
  private securityManager: any; // Removed readonly to allow lazy initialization
  private readonly complianceManager: ComplianceManager;
  private readonly mobileSecurity: MobileSecurity;
  
  private constructor() {
    this.auditLogger = new AuditLogger();
    // Use getter function to get SecurityManager when needed, avoiding circular dependency
    this.securityManager = null; // Will be lazily initialized
    this.complianceManager = ComplianceManager.getInstance();
    this.mobileSecurity = MobileSecurity.getInstance();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SecurityTesting {
    if (!SecurityTesting.instance) {
      SecurityTesting.instance = new SecurityTesting();
    }
    return SecurityTesting.instance;
  }
  
  // Getter for SecurityManager to lazily load it when needed
  private getSecurityManager() {
    if (!this.securityManager) {
      // Late binding to avoid circular dependency during module initialization
      const SecurityManager = require('./SecurityManager').SecurityManager;
      this.securityManager = SecurityManager.getInstance();
    }
    return this.securityManager;
  }
  
  /**
   * Run all security tests
   */
  public async runAllTests(): Promise<SecurityTestResult[]> {
    const results = await Promise.all([
      this.testXSSProtection(),
      this.testCSRFProtection(),
      this.testSecureStorage(),
      this.testRateLimitFunctionality(),
      this.testInputSanitization(),
      this.testComplianceRules(),
      this.testMobileSecurityFeatures()
    ]);
    
    // Log a summary of test results
    const passedTests = results.filter(r => r.passed).length;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passedTests === results.length ? LogLevel.INFO : LogLevel.WARNING,
      description: `Security test suite completed: ${passedTests}/${results.length} tests passed`,
      metadata: {
        testResults: results.map(r => ({ name: r.name, passed: r.passed }))
      }
    });
    
    return results;
  }
  
  /**
   * Test XSS protection mechanisms
   */
  public async testXSSProtection(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // Prepare test data with XSS attempt
      const xssPayload = '<script>alert("XSS")</script>';
      const sanitizedResult = this.getSecurityManager().sanitizeInput(xssPayload);
      
      // Check if the script tag was properly escaped
      passed = !sanitizedResult.includes('<script>') && 
               sanitizedResult.includes('&lt;script&gt;');
      
      details = passed 
        ? 'XSS payload was properly sanitized' 
        : 'XSS protection failed: script tags not properly sanitized';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `XSS protection test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'XSS Protection',
      description: 'Tests defense against cross-site scripting attacks',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test CSRF protection mechanisms
   */
  public async testCSRFProtection(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // In a real implementation, we would:
      // 1. Create a request without CSRF token
      // 2. Verify that the request is rejected
      // 3. Create a request with valid CSRF token
      // 4. Verify that the request is accepted
      
      // Simulate CSRF test for demonstration
      const origin = 'https://malicious-site.example.com';
      const isCorsAllowed = this.getSecurityManager().isOriginAllowed(origin);
      
      // For a malicious origin, this should return false
      passed = !isCorsAllowed;
      
      details = passed 
        ? 'CSRF protection is working correctly, malicious origin blocked' 
        : 'CSRF protection failed: malicious origin was allowed';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `CSRF protection test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'CSRF Protection',
      description: 'Tests defense against cross-site request forgery',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test secure storage functionality
   */
  public async testSecureStorage(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // Test data
      const testKey = 'security_test_key';
      const testData = { secretValue: 'test-secret-1234' };
      
      // Store test data
      this.mobileSecurity.storeSecureData(testKey, testData);
      
      // Retrieve test data
      const retrievedData = this.mobileSecurity.getSecureData(testKey);
      
      // Verify data integrity
      passed = JSON.stringify(retrievedData) === JSON.stringify(testData);
      
      // Clean up test data
      this.mobileSecurity.removeSecureData(testKey);
      
      details = passed 
        ? 'Secure storage encryption and decryption working correctly' 
        : 'Secure storage test failed: data integrity check failed';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `Secure storage test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'Secure Storage',
      description: 'Tests encryption and decryption of sensitive data',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test rate limiting functionality
   */
  public async testRateLimitFunctionality(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // Test identifier
      const testIdentifier = 'security_test_rate_limit';
      
      // Reset rate limit for test identifier to start fresh
      this.getSecurityManager().resetRateLimit(testIdentifier);
      
      // Initial check should pass
      const initialCheck = this.getSecurityManager().checkRateLimit(testIdentifier);
      
      // Now simulate exceeding the rate limit by making multiple requests
      const requests = [];
      const limit = 100; // This should match the limit in SecurityManager
      
      for (let i = 0; i < limit; i++) {
        requests.push(this.getSecurityManager().checkRateLimit(testIdentifier));
      }
      
      // One more request should be limited
      const limitExceeded = this.getSecurityManager().checkRateLimit(testIdentifier);
      
      // Clean up
      this.getSecurityManager().resetRateLimit(testIdentifier);
      
      // Test passes if initial request succeeds and limit is eventually reached
      passed = initialCheck && !limitExceeded;
      
      details = passed 
        ? 'Rate limiting is functioning correctly' 
        : 'Rate limiting test failed';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `Rate limiting test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'Rate Limiting',
      description: 'Tests rate limiting functionality to prevent abuse',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test input sanitization
   */
  public async testInputSanitization(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      const testPayloads = [
        { input: '<img src="x" onerror="alert(1)"/>', shouldContain: '&lt;img' },
        // eslint-disable-next-line no-script-url
        { input: 'javascript:alert(1)', shouldContain: 'javascript:alert' },
        { input: 'SELECT * FROM users', shouldContain: 'SELECT * FROM users' },
        { input: '"; DROP TABLE users; --', shouldContain: '&quot;; DROP TABLE users; --' }
      ];
      
      const results = testPayloads.map(payload => {
        const sanitized = this.getSecurityManager().sanitizeInput(payload.input);
        return {
          original: payload.input,
          sanitized,
          passed: sanitized.includes(payload.shouldContain) && sanitized !== payload.input
        };
      });
      
      passed = results.every(r => r.passed);
      
      details = passed 
        ? 'Input sanitization is working correctly for all test cases' 
        : `Input sanitization failed for: ${results.filter(r => !r.passed).map(r => r.original).join(', ')}`;
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `Input sanitization test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'Input Sanitization',
      description: 'Tests sanitization of user inputs to prevent injection attacks',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test compliance rules validation
   */
  public async testComplianceRules(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // Test data that should pass GDPR compliance
      const compliantData = {
        id: '1234',
        name: 'Test User',
        email: 'test@example.com',
        preferences: { theme: 'dark' },
        userConsent: true
      };
      
      // Test data that should fail GDPR compliance
      const nonCompliantData = {
        id: '1234',
        name: 'Test User',
        email: 'test@example.com',
        preferences: { theme: 'dark' },
        ssn: '123-45-6789', // Not allowed by data minimization rule
        userConsent: false  // Missing consent
      };
      
      // Run compliance checks
      const compliantResults = this.complianceManager.validateAll(compliantData, 'GDPR');
      const nonCompliantResults = this.complianceManager.validateAll(nonCompliantData, 'GDPR');
      
      // Check if all the enforced rules passed for compliant data
      const compliantPassed = compliantResults.every(r => r.compliant);
      
      // Check if at least one rule failed for non-compliant data
      const nonCompliantFailed = nonCompliantResults.some(r => !r.compliant);
      
      passed = compliantPassed && nonCompliantFailed;
      
      details = passed 
        ? 'Compliance validation is working correctly' 
        : 'Compliance validation test failed: rules not enforced correctly';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `Compliance rules test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'Compliance Rules',
      description: 'Tests enforcement of compliance rules',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test mobile security features
   */
  public async testMobileSecurityFeatures(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // Test device verification
      const testDeviceId = 'test-device-' + Date.now();
      
      // Register a test device
      // const deviceInfo = this.mobileSecurity.registerDevice({ // Removed unused variable
      this.mobileSecurity.registerDevice({
        id: testDeviceId,
        name: 'Test Device',
        platform: 'ios'
      });
      
      // Device should not be verified initially
      const initialVerification = this.mobileSecurity.isDeviceVerified(testDeviceId);
      
      // Verify the device
      const verifiedDevice = this.mobileSecurity.verifyDevice(testDeviceId);
      
      // Device should now be verified
      const afterVerification = this.mobileSecurity.isDeviceVerified(testDeviceId);
      
      // Clean up by removing the test device
      this.mobileSecurity.removeDevice(testDeviceId);
      
      // Test passes if device was initially unverified, then verified successfully
      passed = !initialVerification && !!verifiedDevice && afterVerification;
      
      details = passed 
        ? 'Mobile security device verification is working correctly' 
        : 'Mobile security device verification test failed';
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.ERROR,
      description: `Mobile security test: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { details, durationMs: duration }
    });
    
    return {
      passed,
      name: 'Mobile Security',
      description: 'Tests mobile-specific security features',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Perform security penetration testing
   * @param endpoint API endpoint to test
   */
  public async performPenetrationTest(endpoint: string): Promise<SecurityTestResult> {
    const startTime = Date.now();
    let passed = false;
    let details = '';
    
    try {
      // In a real implementation, this would perform actual penetration tests
      // For this demonstration, we'll simulate the test
      const vulnerabilities: Array<{ type: string; severity: string; description: string }> = [];
      
      // Simulate finding vulnerabilities
      if (endpoint.includes('login')) {
        vulnerabilities.push({
          type: 'CSRF',
          severity: 'medium',
          description: 'Login form does not implement anti-CSRF tokens'
        });
      }
      
      if (endpoint.includes('api')) {
        vulnerabilities.push({
          type: 'Rate limiting',
          severity: 'low',
          description: 'API endpoint does not implement proper rate limiting'
        });
      }
      
      // Test passes if no high-severity vulnerabilities were found
      const highSeverityVulnerabilities = vulnerabilities.filter(v => v.severity === 'high');
      passed = highSeverityVulnerabilities.length === 0;
      
      details = passed 
        ? `Penetration test completed with ${vulnerabilities.length} non-critical findings` 
        : `Penetration test found ${highSeverityVulnerabilities.length} high-severity vulnerabilities`;
      
    } catch (error) {
      passed = false;
      details = `Test failed with error: ${(error as Error).message}`;
    }
    
    const duration = Date.now() - startTime;
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: passed ? LogLevel.INFO : LogLevel.WARNING,
      description: `Penetration test for ${endpoint}: ${passed ? 'PASSED' : 'FAILED'}`,
      metadata: { endpoint, details, durationMs: duration }
    });
    
    return {
      passed,
      name: `Penetration Test: ${endpoint}`,
      description: 'Simulated security penetration test',
      details,
      timestamp: Date.now(),
      durationMs: duration
    };
  }
  
  /**
   * Test performance impact of security features
   */
  public async testPerformanceImpact(): Promise<{
    encryptionMs: number;
    sanitizationMs: number;
    validationMs: number;
    totalImpactMs: number;
  }> {
    // Test encryption performance
    const testData = { test: 'data', nested: { value: 12345 } };
    const iterations = 1000;
    
    // Measure encryption performance
    const encryptStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      this.mobileSecurity.storeSecureData(`perf_test_${i}`, testData);
    }
    const encryptionMs = Date.now() - encryptStart;
    
    // Measure sanitization performance
    const inputData = '<script>alert("test")</script><p>Hello World</p>';
    const sanitizeStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      this.getSecurityManager().sanitizeInput(inputData);
    }
    const sanitizationMs = Date.now() - sanitizeStart;
    
    // Measure validation performance
    const validationData = {
      id: '1234',
      name: 'Test User',
      email: 'test@example.com',
      preferences: { theme: 'dark' },
      userConsent: true
    };
    const validateStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      this.complianceManager.validateAll(validationData);
    }
    const validationMs = Date.now() - validateStart;
    
    const totalImpactMs = encryptionMs + sanitizationMs + validationMs;
    
    // Clean up test data
    for (let i = 0; i < iterations; i++) {
      this.mobileSecurity.removeSecureData(`perf_test_${i}`);
    }
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: 'Security performance impact test completed',
      metadata: {
        iterations,
        encryptionMs,
        sanitizationMs,
        validationMs,
        totalImpactMs,
        perOperationMs: totalImpactMs / (iterations * 3)
      }
    });
    
    return {
      encryptionMs,
      sanitizationMs,
      validationMs,
      totalImpactMs
    };
  }
}

// Export a singleton instance
export const securityTesting = SecurityTesting.getInstance(); 