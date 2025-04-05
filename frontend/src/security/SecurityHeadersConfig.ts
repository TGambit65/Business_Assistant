/**
 * SecurityHeadersConfig
 * 
 * Provides configuration and utilities for security headers:
 * - Content-Security-Policy (CSP)
 * - HTTP Strict-Transport-Security (HSTS)
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 * - Feature-Policy / Permissions-Policy
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { PWA_CSP_DIRECTIVES, buildCSPString } from './csp';

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Feature-Policy'?: string;
  'Cache-Control'?: string;
  'Clear-Site-Data'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
}

export interface SecurityHeadersOptions {
  useDefaults?: boolean;
  enableHSTS?: boolean;
  hstsMaxAge?: number;
  hstsIncludeSubDomains?: boolean;
  hstsPreload?: boolean;
  enableCSP?: boolean;
  cspDirectives?: Record<string, string | string[]>;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN';
  xContentTypeOptions?: boolean;
  xXSSProtection?: boolean;
  referrerPolicy?: string;
  enablePermissionsPolicy?: boolean;
  permissionsPolicyDirectives?: Record<string, string | string[]>;
  enableFeaturePolicy?: boolean;
  featurePolicyDirectives?: Record<string, string | string[]>;
  cacheControl?: string;
  clearSiteData?: string[];
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

export class SecurityHeadersConfig {
  private static instance: SecurityHeadersConfig;
  private logger: AuditLogger;
  private headers: SecurityHeaders = {};
  
  private constructor() {
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    
    // Initialize with default security headers
    this.resetToDefaults();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SecurityHeadersConfig {
    if (!SecurityHeadersConfig.instance) {
      SecurityHeadersConfig.instance = new SecurityHeadersConfig();
    }
    return SecurityHeadersConfig.instance;
  }

  /**
   * Reset headers to secure defaults
   */
  public resetToDefaults(): void {
    this.headers = {
      'Content-Security-Policy': buildCSPString(PWA_CSP_DIRECTIVES),
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Security headers reset to defaults'
    });
  }

  /**
   * Configure security headers
   */
  public configure(options: SecurityHeadersOptions): void {
    if (options.useDefaults) {
      this.resetToDefaults();
    }
    
    // Configure Content-Security-Policy
    if (options.enableCSP === false) {
      delete this.headers['Content-Security-Policy'];
    } else if (options.cspDirectives) {
      const cspString = this.buildCSPString(options.cspDirectives);
      if (cspString) {
        this.headers['Content-Security-Policy'] = cspString;
      }
    }
    
    // Configure HSTS
    if (options.enableHSTS === false) {
      delete this.headers['Strict-Transport-Security'];
    } else if (options.hstsMaxAge !== undefined) {
      let hsts = `max-age=${options.hstsMaxAge}`;
      
      if (options.hstsIncludeSubDomains) {
        hsts += '; includeSubDomains';
      }
      
      if (options.hstsPreload) {
        hsts += '; preload';
      }
      
      this.headers['Strict-Transport-Security'] = hsts;
    }
    
    // Configure X-Frame-Options
    if (options.xFrameOptions === undefined) {
      // Keep existing setting
    } else if (options.xFrameOptions === null) {
      delete this.headers['X-Frame-Options'];
    } else {
      this.headers['X-Frame-Options'] = options.xFrameOptions;
    }
    
    // Configure X-Content-Type-Options
    if (options.xContentTypeOptions === false) {
      delete this.headers['X-Content-Type-Options'];
    } else if (options.xContentTypeOptions === true) {
      this.headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    // Configure X-XSS-Protection
    if (options.xXSSProtection === false) {
      delete this.headers['X-XSS-Protection'];
    } else if (options.xXSSProtection === true) {
      this.headers['X-XSS-Protection'] = '1; mode=block';
    }
    
    // Configure Referrer-Policy
    if (options.referrerPolicy === null) {
      delete this.headers['Referrer-Policy'];
    } else if (options.referrerPolicy) {
      this.headers['Referrer-Policy'] = options.referrerPolicy;
    }
    
    // Configure Permissions-Policy
    if (options.enablePermissionsPolicy === false) {
      delete this.headers['Permissions-Policy'];
    } else if (options.permissionsPolicyDirectives) {
      const policyString = this.buildPolicyString(options.permissionsPolicyDirectives);
      if (policyString) {
        this.headers['Permissions-Policy'] = policyString;
      }
    }
    
    // Configure Feature-Policy (deprecated but still used)
    if (options.enableFeaturePolicy === false) {
      delete this.headers['Feature-Policy'];
    } else if (options.featurePolicyDirectives) {
      const policyString = this.buildPolicyString(options.featurePolicyDirectives);
      if (policyString) {
        this.headers['Feature-Policy'] = policyString;
      }
    }
    
    // Configure Cache-Control
    if (options.cacheControl === null) {
      delete this.headers['Cache-Control'];
    } else if (options.cacheControl) {
      this.headers['Cache-Control'] = options.cacheControl;
    }
    
    // Configure Clear-Site-Data
    if (options.clearSiteData && options.clearSiteData.length > 0) {
      this.headers['Clear-Site-Data'] = `"${options.clearSiteData.join('", "')}"`;
    } else if (options.clearSiteData === null) {
      delete this.headers['Clear-Site-Data'];
    }
    
    // Configure Cross-Origin-Embedder-Policy
    if (options.crossOriginEmbedderPolicy === null) {
      delete this.headers['Cross-Origin-Embedder-Policy'];
    } else if (options.crossOriginEmbedderPolicy) {
      this.headers['Cross-Origin-Embedder-Policy'] = options.crossOriginEmbedderPolicy;
    }
    
    // Configure Cross-Origin-Opener-Policy
    if (options.crossOriginOpenerPolicy === null) {
      delete this.headers['Cross-Origin-Opener-Policy'];
    } else if (options.crossOriginOpenerPolicy) {
      this.headers['Cross-Origin-Opener-Policy'] = options.crossOriginOpenerPolicy;
    }
    
    // Configure Cross-Origin-Resource-Policy
    if (options.crossOriginResourcePolicy === null) {
      delete this.headers['Cross-Origin-Resource-Policy'];
    } else if (options.crossOriginResourcePolicy) {
      this.headers['Cross-Origin-Resource-Policy'] = options.crossOriginResourcePolicy;
    }
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Security headers configuration updated'
    });
  }

  /**
   * Get all configured security headers
   */
  public getHeaders(): SecurityHeaders {
    return { ...this.headers };
  }

  /**
   * Get a specific security header
   */
  public getHeader(name: keyof SecurityHeaders): string | undefined {
    return this.headers[name];
  }

  /**
   * Apply security headers to a response object (Node.js/Express)
   */
  public applyHeaders(response: any): void {
    if (!response || typeof response.set !== 'function') {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to apply security headers: Invalid response object'
      });
      return;
    }
    
    Object.entries(this.headers).forEach(([name, value]) => {
      if (value) {
        response.set(name, value);
      }
    });
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Security headers applied to response'
    });
  }

  /**
   * Generate Meta and Link tags for CSP in HTML
   * This is useful for environments where HTTP headers can't be set directly
   */
  public generateHTMLTags(): string {
    let tags = '';
    
    // CSP meta tag
    if (this.headers['Content-Security-Policy']) {
      tags += `<meta http-equiv="Content-Security-Policy" content="${this.escapeHtml(this.headers['Content-Security-Policy'])}">\n`;
    }
    
    // HSTS is not applicable as meta tag
    
    // X-Frame-Options meta tag
    if (this.headers['X-Frame-Options']) {
      tags += `<meta http-equiv="X-Frame-Options" content="${this.escapeHtml(this.headers['X-Frame-Options'])}">\n`;
    }
    
    // X-Content-Type-Options meta tag
    if (this.headers['X-Content-Type-Options']) {
      tags += `<meta http-equiv="X-Content-Type-Options" content="${this.escapeHtml(this.headers['X-Content-Type-Options'])}">\n`;
    }
    
    // X-XSS-Protection meta tag
    if (this.headers['X-XSS-Protection']) {
      tags += `<meta http-equiv="X-XSS-Protection" content="${this.escapeHtml(this.headers['X-XSS-Protection'])}">\n`;
    }
    
    // Referrer-Policy meta tag
    if (this.headers['Referrer-Policy']) {
      tags += `<meta name="referrer" content="${this.escapeHtml(this.headers['Referrer-Policy'])}">\n`;
    }
    
    // Permissions-Policy meta tag (no standard meta equivalent)
    
    // Cache-Control meta tag
    if (this.headers['Cache-Control']) {
      tags += `<meta http-equiv="Cache-Control" content="${this.escapeHtml(this.headers['Cache-Control'])}">\n`;
    }
    
    return tags;
  }

  /**
   * Build a CSP string from directives
   */
  private buildCSPString(directives: Record<string, string | string[]>): string {
    const parts: string[] = [];
    
    for (const [directive, value] of Object.entries(directives)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push(`${directive} ${value.join(' ')}`);
        } else {
          parts.push(`${directive}`);
        }
      } else if (value) {
        parts.push(`${directive} ${value}`);
      } else {
        parts.push(`${directive}`);
      }
    }
    
    return parts.join('; ');
  }

  /**
   * Build a Feature-Policy or Permissions-Policy string from directives
   */
  private buildPolicyString(directives: Record<string, string | string[]>): string {
    const parts: string[] = [];
    
    for (const [feature, value] of Object.entries(directives)) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          parts.push(`${feature}=(${value.join(' ')})`);
        } else {
          parts.push(`${feature}=()`);
        }
      } else if (value) {
        parts.push(`${feature}=(${value})`);
      } else {
        parts.push(`${feature}=()`);
      }
    }
    
    return parts.join(', ');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Export singleton instance
export const securityHeadersConfig = SecurityHeadersConfig.getInstance(); 