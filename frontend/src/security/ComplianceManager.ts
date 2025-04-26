/**
 * Compliance Manager
 * 
 * Provides functionality for enforcing compliance rules,
 * validating data, and generating compliance reports.
 */

import { AuditLogger, EventType, LogLevel } from './AuditLogger';
import { ComplianceRule, ComplianceValidationResult } from '../types/security';

export class ComplianceManager {
  private static instance: ComplianceManager;
  private rules: Map<string, ComplianceRule> = new Map();
  private readonly auditLogger: AuditLogger;
  
  private constructor() {
    this.auditLogger = new AuditLogger();
    this.initializeDefaultRules();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }
  
  /**
   * Add a compliance rule
   * @param rule The rule to add
   */
  public addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `Compliance rule "${rule.name}" (${rule.id}) added`,
    });
  }
  
  /**
   * Remove a compliance rule
   * @param ruleId ID of the rule to remove
   */
  public removeRule(ruleId: string): void {
    if (this.rules.has(ruleId)) {
      const rule = this.rules.get(ruleId);
      this.rules.delete(ruleId);
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Compliance rule "${rule?.name}" (${ruleId}) removed`,
      });
    }
  }
  
  /**
   * Update an existing compliance rule
   * @param rule Updated rule definition
   */
  public updateRule(rule: ComplianceRule): void {
    if (this.rules.has(rule.id)) {
      this.rules.set(rule.id, rule);
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Compliance rule "${rule.name}" (${rule.id}) updated`,
      });
    } else {
      throw new Error(`Rule with ID ${rule.id} does not exist.`);
    }
  }
  
  /**
   * Get all compliance rules
   * @param standardFilter Optional standard to filter by
   */
  public getRules(standardFilter?: string): ComplianceRule[] {
    const allRules = Array.from(this.rules.values());
    
    if (standardFilter) {
      return allRules.filter(rule => rule.standard === standardFilter);
    }
    
    return allRules;
  }
  
  /**
   * Validate data against a specific rule
   * @param ruleId ID of the rule to validate against
   * @param data Data to validate
   */
  public validateRule(ruleId: string, data: any): ComplianceValidationResult {
    const rule = this.rules.get(ruleId);
    
    if (!rule) {
      throw new Error(`Rule with ID ${ruleId} does not exist.`);
    }
    
    // Skip validation if rule is not enforced
    if (!rule.enforced) {
      return {
        compliant: true,
        rule,
        details: 'Rule is not enforced',
        timestamp: Date.now()
      };
    }
    
    // If rule has a validation function, use it
    let compliant = true;
    let details = 'Compliant';
    
    if (rule.validationFn) {
      try {
        compliant = rule.validationFn(data);
        if (!compliant) {
          details = 'Failed validation function';
        }
      } catch (error) {
        compliant = false;
        details = `Validation error: ${(error as Error).message}`;
      }
    }
    
    // Log validation result
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: compliant ? LogLevel.INFO : LogLevel.WARNING,
      description: `Compliance validation for rule "${rule.name}" (${rule.id}): ${compliant ? 'PASSED' : 'FAILED'} - ${details}`,
    });
    
    return {
      compliant,
      rule,
      details,
      timestamp: Date.now(),
      data
    };
  }
  
  /**
   * Validate data against all enforced rules
   * @param data Data to validate
   * @param standardFilter Optional standard to filter by
   */
  public validateAll(data: any, standardFilter?: string): ComplianceValidationResult[] {
    const rulesToValidate = this.getRules(standardFilter).filter(rule => rule.enforced);
    
    return rulesToValidate.map(rule => this.validateRule(rule.id, data));
  }
  
  /**
   * Enforce a compliance rule
   * @param ruleId ID of the rule to enforce
   * @param enforced Whether the rule should be enforced
   */
  public enforceRule(ruleId: string, enforced: boolean): void {
    const rule = this.rules.get(ruleId);
    
    if (!rule) {
      throw new Error(`Rule with ID ${ruleId} does not exist.`);
    }
    
    rule.enforced = enforced;
    this.rules.set(ruleId, rule);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `Compliance rule "${rule.name}" (${rule.id}) ${enforced ? 'enforced' : 'disabled'}`,
    });
  }
  
  /**
   * Automatically enforce rules from a specific standard
   * @param standard The compliance standard to enforce
   * @param enforce Whether to enforce or disable these rules
   */
  public enforceStandard(standard: string, enforce: boolean): void {
    const standardRules = this.getRules(standard);
    
    for (const rule of standardRules) {
      rule.enforced = enforce;
      this.rules.set(rule.id, rule);
    }
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: `${standard} compliance standards ${enforce ? 'enforced' : 'disabled'} (${standardRules.length} rules affected)`,
    });
  }
  
  /**
   * Generate a compliance report for all rules
   * @param data Data to validate for the report
   */
  public generateComplianceReport(data: any): {
    timestamp: number;
    standardsCompliance: Record<string, {
      compliant: boolean;
      totalRules: number;
      passedRules: number;
      failedRules: number;
      notEnforced: number;
    }>;
    results: ComplianceValidationResult[];
    overallCompliance: boolean;
  } {
    const results = this.validateAll(data);
    const standardsMap = new Map<string, {
      compliant: boolean;
      totalRules: number;
      passedRules: number;
      failedRules: number;
      notEnforced: number;
    }>();
    
    // Group results by standard
    for (const rule of this.getRules()) {
      if (!standardsMap.has(rule.standard)) {
        standardsMap.set(rule.standard, {
          compliant: true,
          totalRules: 0,
          passedRules: 0,
          failedRules: 0,
          notEnforced: 0
        });
      }
      
      const standardStats = standardsMap.get(rule.standard)!;
      standardStats.totalRules++;
      
      if (!rule.enforced) {
        standardStats.notEnforced++;
      }
    }
    
    // Update statistics based on validation results
    for (const result of results) {
      const standard = result.rule.standard;
      const standardStats = standardsMap.get(standard)!;
      
      if (result.compliant) {
        standardStats.passedRules++;
      } else {
        standardStats.failedRules++;
        standardStats.compliant = false;
      }
    }
    
    // Convert map to record for the report
    const standardsCompliance: Record<string, any> = {};
    Array.from(standardsMap.entries()).forEach(([standard, stats]) => {
      standardsCompliance[standard] = stats;
    });
    
    // Determine overall compliance
    const overallCompliance = results.every(result => result.compliant);
    
    return {
      timestamp: Date.now(),
      standardsCompliance,
      results,
      overallCompliance
    };
  }
  
  /**
   * Initialize default compliance rules
   */
  private initializeDefaultRules(): void {
    // GDPR Rules
    this.addRule({
      id: 'gdpr-data-consent',
      name: 'User Consent Required',
      description: 'Validate that user consent is obtained before processing personal data',
      standard: 'GDPR',
      enforced: true,
      validationFn: (data) => {
        // Example validation: check if consent flag exists and is true
        return data && data.userConsent === true;
      },
      remediationSteps: [
        'Implement explicit consent mechanism',
        'Store consent with timestamp',
        'Provide option to withdraw consent'
      ],
      severity: 'high',
      category: 'data-protection'
    });
    
    this.addRule({
      id: 'gdpr-data-minimization',
      name: 'Data Minimization',
      description: 'Ensure only necessary data is collected and processed',
      standard: 'GDPR',
      enforced: true,
      validationFn: (data) => {
        // Example validation: check that only allowed fields are present
        const allowedFields = ['id', 'name', 'email', 'preferences'];
        if (!data) return true;
        
        return Object.keys(data).every(key => allowedFields.includes(key));
      },
      remediationSteps: [
        'Review data collection forms',
        'Remove unnecessary data fields',
        'Implement data retention policies'
      ],
      severity: 'medium',
      category: 'data-protection'
    });
    
    // SOC2 Rules
    this.addRule({
      id: 'soc2-access-control',
      name: 'Proper Access Controls',
      description: 'Verify that proper access controls are implemented',
      standard: 'SOC2',
      enforced: true,
      validationFn: (data) => {
        // Example validation: check for role-based access control
        return data && data.hasOwnProperty('role') && data.hasOwnProperty('permissions');
      },
      remediationSteps: [
        'Implement role-based access control',
        'Regular access reviews',
        'Implement principle of least privilege'
      ],
      severity: 'critical',
      category: 'access-control'
    });
    
    // HIPAA Rules
    this.addRule({
      id: 'hipaa-phi-encryption',
      name: 'PHI Encryption',
      description: 'Validate that Protected Health Information is encrypted',
      standard: 'HIPAA',
      enforced: false,
      validationFn: (data) => {
        // Example validation: check that health data is marked as encrypted
        return data && data.healthData ? data.healthData.encrypted === true : true;
      },
      remediationSteps: [
        'Implement end-to-end encryption',
        'Use strong encryption algorithms',
        'Secure key management'
      ],
      severity: 'critical',
      category: 'encryption'
    });
    
    // PCI-DSS Rules
    this.addRule({
      id: 'pci-dss-card-data',
      name: 'Secure Card Data',
      description: 'Ensure credit card data is handled securely',
      standard: 'PCI-DSS',
      enforced: false,
      validationFn: (data) => {
        // Example validation: check that card data is not stored or is tokenized
        if (!data) return true;
        if (data.cardNumber) return false; // Should not store full card numbers
        if (data.cardData && !data.cardData.tokenized) return false;
        return true;
      },
      remediationSteps: [
        'Use tokenization for card data',
        'Do not store sensitive authentication data',
        'Implement strong access controls'
      ],
      severity: 'critical',
      category: 'data-protection'
    });
  }
}

// Export a singleton instance
export const complianceManager = ComplianceManager.getInstance(); 