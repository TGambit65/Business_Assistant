/**
 * IntegrityVerifier
 * 
 * Provides integrity verification features to detect tampering:
 * - Verifies script integrity using SRI (Subresource Integrity)
 * - Validates runtime environment
 * - Detects DevTools and debugging attempts
 * - Monitors DOM mutations for injected code
 * - Validates configuration integrity
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { sha256 } from './utilities';

export interface IntegrityCheckResult {
  valid: boolean;
  issues: IntegrityIssue[];
}

export interface IntegrityIssue {
  type: IntegrityIssueType;
  description: string;
  severity: IntegritySeverity;
  metadata?: Record<string, any>;
}

export enum IntegrityIssueType {
  SCRIPT_INTEGRITY = 'SCRIPT_INTEGRITY',
  DOM_MANIPULATION = 'DOM_MANIPULATION',
  DEVTOOLS_DETECTED = 'DEVTOOLS_DETECTED',
  CONFIG_TAMPERING = 'CONFIG_TAMPERING',
  RUNTIME_ENVIRONMENT = 'RUNTIME_ENVIRONMENT',
  PROTOTYPE_POLLUTION = 'PROTOTYPE_POLLUTION'
}

export enum IntegritySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface ScriptIntegrityCheck {
  src: string;
  expectedHash: string;
}

export interface ConfigIntegrityCheck {
  configPath: string;
  expectedHash: string;
}

export interface IntegrityVerifierOptions {
  autoStart?: boolean;
  scriptChecks?: ScriptIntegrityCheck[];
  configChecks?: ConfigIntegrityCheck[];
  monitorDomChanges?: boolean;
  detectDevTools?: boolean;
  checkPrototypes?: boolean;
  checkRuntime?: boolean;
}

export class IntegrityVerifier {
  private static instance: IntegrityVerifier;
  private logger: AuditLogger;
  private options: IntegrityVerifierOptions;
  private issues: IntegrityIssue[] = [];
  private domObserver?: MutationObserver;
  private devToolsDetectionInterval?: number;
  private isMonitoring: boolean = false;
  
  private constructor(options: IntegrityVerifierOptions = {}) {
    this.options = {
      autoStart: false,
      scriptChecks: [],
      configChecks: [],
      monitorDomChanges: true,
      detectDevTools: true,
      checkPrototypes: true,
      checkRuntime: true,
      ...options
    };
    
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    
    if (this.options.autoStart) {
      this.startMonitoring();
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(options?: IntegrityVerifierOptions): IntegrityVerifier {
    if (!IntegrityVerifier.instance) {
      IntegrityVerifier.instance = new IntegrityVerifier(options);
    } else if (options) {
      // Update options if provided
      IntegrityVerifier.instance.updateOptions(options);
    }
    
    return IntegrityVerifier.instance;
  }

  /**
   * Update verifier options
   */
  public updateOptions(options: Partial<IntegrityVerifierOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    // Restart monitoring if already running
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Start integrity monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    
    // Set up DOM observer if enabled
    if (this.options.monitorDomChanges) {
      this.setupDomObserver();
    }
    
    // Set up DevTools detection if enabled
    if (this.options.detectDevTools) {
      this.setupDevToolsDetection();
    }
    
    // Perform initial checks
    this.performInitialChecks();
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Integrity monitoring started',
      metadata: { options: this.options }
    });
  }

  /**
   * Stop integrity monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }
    
    // Disconnect DOM observer
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = undefined;
    }
    
    // Clear DevTools detection interval
    if (this.devToolsDetectionInterval) {
      window.clearInterval(this.devToolsDetectionInterval);
      this.devToolsDetectionInterval = undefined;
    }
    
    this.isMonitoring = false;
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Integrity monitoring stopped'
    });
  }

  /**
   * Perform a full integrity check
   */
  public async checkIntegrity(): Promise<IntegrityCheckResult> {
    this.issues = [];
    
    // Check script integrity if configured
    if (this.options.scriptChecks && this.options.scriptChecks.length > 0) {
      await this.checkScriptIntegrity();
    }
    
    // Check config integrity if configured
    if (this.options.configChecks && this.options.configChecks.length > 0) {
      await this.checkConfigIntegrity();
    }
    
    // Check prototype pollution if enabled
    if (this.options.checkPrototypes) {
      this.checkPrototypePollution();
    }
    
    // Check runtime environment if enabled
    if (this.options.checkRuntime) {
      this.checkRuntimeEnvironment();
    }
    
    const result: IntegrityCheckResult = {
      valid: this.issues.length === 0,
      issues: [...this.issues]
    };
    
    if (!result.valid) {
      const criticalIssues = this.issues.filter(issue => issue.severity === IntegritySeverity.CRITICAL);
      
      this.logger.log({
        level: criticalIssues.length > 0 ? LogLevel.CRITICAL : LogLevel.WARNING,
        type: EventType.SUSPICIOUS_ACTIVITY,
        description: `Integrity check failed with ${this.issues.length} issues (${criticalIssues.length} critical)`,
        metadata: { issues: this.issues }
      });
    } else {
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Integrity check passed'
      });
    }
    
    return result;
  }

  /**
   * Get current integrity issues
   */
  public getIssues(): IntegrityIssue[] {
    return [...this.issues];
  }

  /**
   * Clear tracked issues
   */
  public clearIssues(): void {
    this.issues = [];
  }

  /**
   * Register a script to verify
   */
  public registerScript(src: string, expectedHash: string): void {
    this.options.scriptChecks = [
      ...(this.options.scriptChecks || []),
      { src, expectedHash }
    ];
  }

  /**
   * Register a configuration object to verify
   */
  public registerConfig(configPath: string, expectedHash: string): void {
    this.options.configChecks = [
      ...(this.options.configChecks || []),
      { configPath, expectedHash }
    ];
  }

  /**
   * Perform initial integrity checks
   */
  private async performInitialChecks(): Promise<void> {
    // Perform a full integrity check
    await this.checkIntegrity();
    
    // Set up periodic checking
    setInterval(() => {
      this.checkIntegrity().catch(error => {
        this.logger.log({
          level: LogLevel.ERROR,
          type: EventType.SUSPICIOUS_ACTIVITY,
          description: 'Error during periodic integrity check',
          metadata: { error }
        });
      });
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Set up DOM mutation observer
   */
  private setupDomObserver(): void {
    if (!window.MutationObserver) {
      this.addIssue({
        type: IntegrityIssueType.RUNTIME_ENVIRONMENT,
        description: 'MutationObserver not supported',
        severity: IntegritySeverity.WARNING
      });
      
      return;
    }
    
    this.domObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        // Look for added script elements
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'SCRIPT') {
              const scriptNode = node as HTMLScriptElement;
              
              // Check if the script is in our known list
              const knownScript = this.options.scriptChecks?.find(
                check => check.src === scriptNode.src
              );
              
              if (!knownScript && scriptNode.src) {
                // Unknown script detected
                this.addIssue({
                  type: IntegrityIssueType.DOM_MANIPULATION,
                  description: 'Unknown script added to DOM',
                  severity: IntegritySeverity.CRITICAL,
                  metadata: {
                    src: scriptNode.src,
                    content: scriptNode.text.substring(0, 100)
                  }
                });
              }
              
              // Inline scripts are a risk too
              if (scriptNode.text && !scriptNode.src) {
                this.addIssue({
                  type: IntegrityIssueType.DOM_MANIPULATION,
                  description: 'Inline script added to DOM',
                  severity: IntegritySeverity.WARNING,
                  metadata: {
                    content: scriptNode.text.substring(0, 100)
                  }
                });
              }
            }
          });
        }
        
        // Look for attribute changes on scripts
        if (mutation.type === 'attributes' && 
            mutation.target.nodeName === 'SCRIPT' && 
            mutation.attributeName) {
          
          const scriptNode = mutation.target as HTMLScriptElement;
          
          this.addIssue({
            type: IntegrityIssueType.DOM_MANIPULATION,
            description: `Script attribute changed: ${mutation.attributeName}`,
            severity: IntegritySeverity.WARNING,
            metadata: {
              src: scriptNode.src,
              attributeName: mutation.attributeName,
              attributeValue: scriptNode.getAttribute(mutation.attributeName)
            }
          });
        }
      }
    });
    
    // Start observing the document with configured parameters
    this.domObserver.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'integrity', 'type', 'crossorigin']
    });
  }

  /**
   * Set up DevTools detection
   */
  private setupDevToolsDetection(): void {
    // Method 1: Check for dev tools object
    this.checkForDevTools();
    
    // Method 2: Timing-based detection (less reliable but works in some cases)
    this.devToolsDetectionInterval = window.setInterval(() => {
      this.detectDevToolsByTiming();
    }, 1000);
  }

  /**
   * Check for DevTools objects directly
   */
  private checkForDevTools(): void {
    // Check for Firefox dev tools
    if ((window as any).Firebug || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      this.addIssue({
        type: IntegrityIssueType.DEVTOOLS_DETECTED,
        description: 'Developer tools detected (Firefox/React)',
        severity: IntegritySeverity.WARNING
      });
    }
    
    // More advanced detection can be implemented but may have false positives
  }

  /**
   * Detect DevTools by measuring function execution time
   */
  private detectDevToolsByTiming(): void {
    const start = performance.now();
    
    // This debug call is typically much slower when dev tools are open
    console.debug('DevTools detection check');
    
    const end = performance.now();
    const elapsed = end - start;
    
    // Threshold determined empirically - may need adjustment
    if (elapsed > 5) {
      this.addIssue({
        type: IntegrityIssueType.DEVTOOLS_DETECTED,
        description: 'Developer tools likely open (timing-based detection)',
        severity: IntegritySeverity.INFO,
        metadata: { executionTime: elapsed }
      });
    }
  }

  /**
   * Check script integrity
   */
  private async checkScriptIntegrity(): Promise<void> {
    if (!this.options.scriptChecks || this.options.scriptChecks.length === 0) {
      return;
    }
    
    // Find all scripts in the document
    const scriptElements = Array.from(document.querySelectorAll('script[src]'));
    
    for (const scriptCheck of this.options.scriptChecks) {
      // Find matching script element
      const scriptElement = scriptElements.find(script => script.getAttribute('src') === scriptCheck.src);
      
      if (!scriptElement) {
        this.addIssue({
          type: IntegrityIssueType.SCRIPT_INTEGRITY,
          description: `Required script not found: ${scriptCheck.src}`,
          severity: IntegritySeverity.CRITICAL,
          metadata: { src: scriptCheck.src }
        });
        continue;
      }
      
      // Check if integrity attribute is present and matches
      const integrity = scriptElement.getAttribute('integrity');
      
      if (!integrity) {
        this.addIssue({
          type: IntegrityIssueType.SCRIPT_INTEGRITY,
          description: `Script missing integrity attribute: ${scriptCheck.src}`,
          severity: IntegritySeverity.WARNING,
          metadata: { src: scriptCheck.src }
        });
        continue;
      }
      
      if (integrity !== scriptCheck.expectedHash) {
        this.addIssue({
          type: IntegrityIssueType.SCRIPT_INTEGRITY,
          description: `Script integrity mismatch: ${scriptCheck.src}`,
          severity: IntegritySeverity.CRITICAL,
          metadata: { 
            src: scriptCheck.src,
            expectedHash: scriptCheck.expectedHash,
            actualHash: integrity
          }
        });
      }
    }
  }

  /**
   * Check configuration integrity
   */
  private async checkConfigIntegrity(): Promise<void> {
    if (!this.options.configChecks || this.options.configChecks.length === 0) {
      return;
    }
    
    for (const configCheck of this.options.configChecks) {
      try {
        // Get the configuration object using the path
        const config = this.getObjectByPath(window, configCheck.configPath);
        
        if (!config) {
          this.addIssue({
            type: IntegrityIssueType.CONFIG_TAMPERING,
            description: `Configuration not found: ${configCheck.configPath}`,
            severity: IntegritySeverity.WARNING,
            metadata: { configPath: configCheck.configPath }
          });
          continue;
        }
        
        // Calculate the hash of the configuration object
        const configString = JSON.stringify(config);
        const configBuffer = await sha256(configString);
        const configHash = this.arrayBufferToHex(configBuffer);
        
        if (configHash !== configCheck.expectedHash) {
          this.addIssue({
            type: IntegrityIssueType.CONFIG_TAMPERING,
            description: `Configuration has been modified: ${configCheck.configPath}`,
            severity: IntegritySeverity.CRITICAL,
            metadata: {
              configPath: configCheck.configPath,
              expectedHash: configCheck.expectedHash,
              actualHash: configHash
            }
          });
        }
      } catch (error) {
        this.addIssue({
          type: IntegrityIssueType.CONFIG_TAMPERING,
          description: `Error checking configuration: ${configCheck.configPath}`,
          severity: IntegritySeverity.WARNING,
          metadata: { 
            configPath: configCheck.configPath,
            error: (error as Error).message
          }
        });
      }
    }
  }

  /**
   * Check for prototype pollution
   */
  private checkPrototypePollution(): void {
    // Check Object prototype for unexpected properties
    const objectProto = Object.prototype;
    const nativeObjectProps = [
      'constructor', 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
      'isPrototypeOf', 'propertyIsEnumerable', '__defineGetter__',
      '__defineSetter__', '__lookupGetter__', '__lookupSetter__'
    ];
    
    for (const prop in objectProto) {
      if (!nativeObjectProps.includes(prop)) {
        this.addIssue({
          type: IntegrityIssueType.PROTOTYPE_POLLUTION,
          description: `Object prototype polluted with property: ${prop}`,
          severity: IntegritySeverity.CRITICAL,
          metadata: { property: prop }
        });
      }
    }
    
    // Check Array prototype for unexpected properties
    const arrayProto = Array.prototype;
    const nativeArrayProps = [
      'constructor', 'toString', 'toLocaleString', 'join', 'pop', 'push',
      'reverse', 'shift', 'slice', 'sort', 'splice', 'unshift', 'indexOf',
      'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce',
      'reduceRight', 'find', 'findIndex', 'entries', 'keys', 'values',
      'includes', 'copyWithin', 'fill', 'flat', 'flatMap', 'at', 'concat',
      'length', 'Symbol(Symbol.iterator)', 'Symbol(Symbol.unscopables)'
    ];
    
    for (const prop in arrayProto) {
      if (!nativeArrayProps.includes(prop) && !prop.startsWith('Symbol(')) {
        this.addIssue({
          type: IntegrityIssueType.PROTOTYPE_POLLUTION,
          description: `Array prototype polluted with property: ${prop}`,
          severity: IntegritySeverity.CRITICAL,
          metadata: { property: prop }
        });
      }
    }
  }

  /**
   * Check runtime environment
   */
  private checkRuntimeEnvironment(): void {
    // Check if running in expected context
    if (!(window as any).isSecureContext) {
      this.addIssue({
        type: IntegrityIssueType.RUNTIME_ENVIRONMENT,
        description: 'Application not running in secure context (HTTPS)',
        severity: IntegritySeverity.CRITICAL
      });
    }
    
    // Check for browser features needed for security
    if (!window.crypto || !window.crypto.subtle) {
      this.addIssue({
        type: IntegrityIssueType.RUNTIME_ENVIRONMENT,
        description: 'Web Crypto API not available',
        severity: IntegritySeverity.CRITICAL
      });
    }
    
    // Check for unexpected frames or embedded context
    if (window !== window.top) {
      this.addIssue({
        type: IntegrityIssueType.RUNTIME_ENVIRONMENT,
        description: 'Application running in an iframe',
        severity: IntegritySeverity.WARNING,
        metadata: {
          parentOrigin: document.referrer
        }
      });
    }
  }

  /**
   * Add an integrity issue to the tracked issues
   */
  private addIssue(issue: IntegrityIssue): void {
    // Check if this exact issue already exists
    const existingIssue = this.issues.find(
      existing => 
        existing.type === issue.type && 
        existing.description === issue.description
    );
    
    if (!existingIssue) {
      this.issues.push(issue);
      
      // Log the issue
      this.logger.log({
        level: this.mapSeverityToLogLevel(issue.severity),
        type: EventType.SUSPICIOUS_ACTIVITY,
        description: issue.description,
        metadata: {
          issueType: issue.type,
          ...issue.metadata
        }
      });
    }
  }

  /**
   * Map integrity severity to log level
   */
  private mapSeverityToLogLevel(severity: IntegritySeverity): LogLevel {
    switch (severity) {
      case IntegritySeverity.CRITICAL:
        return LogLevel.CRITICAL;
      case IntegritySeverity.WARNING:
        return LogLevel.WARNING;
      case IntegritySeverity.INFO:
        return LogLevel.INFO;
      default:
        return LogLevel.WARNING;
    }
  }

  /**
   * Get an object by its path string (e.g., "window.app.config")
   */
  private getObjectByPath(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr];
    }, obj);
  }

  /**
   * Convert ArrayBuffer to hexadecimal string
   */
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Export singleton instance
export const integrityVerifier = IntegrityVerifier.getInstance(); 