/**
 * Email Template Service API
 * 
 * Handles API calls to the backend for email template operations
 */

import { Template, TemplateValidationResult, Variable } from '../../../shared/types/template';
import { templateEngine } from './TemplateEngine';
import { analyticsService } from './AnalyticsService';

export interface TemplateSearchCriteria {
  query?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  createdBy?: string;
}

export interface TemplateImportResult {
  success: boolean;
  imported: Template[];
  errors: string[];
  duplicates: string[];
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export class EmailTemplateServiceAPI {
  private static instance: EmailTemplateServiceAPI;
  private authToken: string | null = null;

  private constructor() {
    // Get auth token from localStorage or auth service
    this.authToken = localStorage.getItem('authToken') || 'Bearer test-token'; // For testing
  }

  public static getInstance(): EmailTemplateServiceAPI {
    if (!EmailTemplateServiceAPI.instance) {
      EmailTemplateServiceAPI.instance = new EmailTemplateServiceAPI();
    }
    return EmailTemplateServiceAPI.instance;
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken || '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  }

  /**
   * Get all templates for a user
   */
  public async getTemplates(userId: string): Promise<Template[]> {
    try {
      const templates = await this.fetchAPI('/templates');
      
      // Track template viewing
      analyticsService.trackMetric('template.list_viewed', 1, { 
        userId,
        count: templates.length 
      });

      return templates;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   */
  public async getTemplate(templateId: string): Promise<Template | null> {
    try {
      const template = await this.fetchAPI(`/templates/${templateId}`);
      
      if (template) {
        analyticsService.trackMetric('template.viewed', 1, { 
          templateId,
          category: template.category 
        });
      }

      return template;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      return null;
    }
  }

  /**
   * Create a new template
   */
  public async createTemplate(
    templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy'>,
    userId: string
  ): Promise<Template> {
    // Validate template
    const validationResult = this.validateTemplate(templateData as Template);
    if (!validationResult.isValid) {
      throw new Error(`Template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    const template = await this.fetchAPI('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });

    analyticsService.trackMetric('template.created', 1, {
      templateId: template.id,
      category: template.category,
      hasVariables: template.variables.length > 0,
      aiEnabled: template.aiSuggestions
    });

    return template;
  }

  /**
   * Update an existing template
   */
  public async updateTemplate(
    templateId: string, 
    updates: Partial<Template>,
    userId: string
  ): Promise<Template> {
    // Validate updated template if needed
    if (updates.name !== undefined || updates.subject !== undefined || updates.content !== undefined) {
      const validationResult = this.validateTemplate({ ...updates } as Template);
      if (!validationResult.isValid) {
        throw new Error(`Template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }
    }

    const template = await this.fetchAPI(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    analyticsService.trackMetric('template.updated', 1, {
      templateId,
      category: template.category,
      version: template.version
    });

    return template;
  }

  /**
   * Delete a template
   */
  public async deleteTemplate(templateId: string, userId: string): Promise<void> {
    await this.fetchAPI(`/templates/${templateId}`, {
      method: 'DELETE',
    });

    analyticsService.trackMetric('template.deleted', 1, {
      templateId
    });
  }

  /**
   * Duplicate a template
   */
  public async duplicateTemplate(templateId: string, userId: string): Promise<Template> {
    const template = await this.fetchAPI(`/templates/${templateId}/duplicate`, {
      method: 'POST',
    });

    analyticsService.trackMetric('template.duplicated', 1, {
      originalId: templateId,
      duplicateId: template.id,
      category: template.category
    });

    return template;
  }

  /**
   * Search templates
   */
  public async searchTemplates(
    criteria: TemplateSearchCriteria,
    userId: string
  ): Promise<Template[]> {
    const params = new URLSearchParams();
    if (criteria.query) params.append('query', criteria.query);
    if (criteria.category) params.append('category', criteria.category);
    if (criteria.tags) criteria.tags.forEach(tag => params.append('tags', tag));
    if (criteria.isPublic !== undefined) params.append('isPublic', criteria.isPublic.toString());
    if (criteria.createdBy) params.append('createdBy', criteria.createdBy);

    const templates = await this.fetchAPI(`/templates/search?${params.toString()}`);

    analyticsService.trackMetric('template.searched', 1, {
      query: criteria.query,
      category: criteria.category,
      resultCount: templates.length
    });

    return templates;
  }

  /**
   * Get template categories
   */
  public async getCategories(): Promise<string[]> {
    return this.fetchAPI('/templates/categories');
  }

  /**
   * Get all tags
   */
  public async getTags(): Promise<string[]> {
    return this.fetchAPI('/templates/tags');
  }

  /**
   * Generate template from email content
   */
  public async generateTemplateFromEmail(
    emailContent: string,
    subject: string,
    userId: string,
    templateName?: string
  ): Promise<Template> {
    // Extract variables from content (basic implementation)
    const variables: Variable[] = [];
    const variableMatches = emailContent.match(/\{\{(\w+)\}\}/g);
    
    if (variableMatches) {
      const uniqueVars = new Set(variableMatches.map(match => match.slice(2, -2)));
      uniqueVars.forEach((varName) => {
        variables.push({
          id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: varName,
          type: 'text',
          required: false,
          description: `Auto-detected variable: ${varName}`
        });
      });
    }

    const template = await this.createTemplate({
      name: templateName || `Template from Email - ${new Date().toLocaleDateString()}`,
      subject,
      content: emailContent,
      variables,
      aiSuggestions: false,
      category: 'General',
      permissions: [],
      isPublic: false,
      tags: ['auto-generated'],
      metadata: {
        description: 'Template generated from email content'
      }
    }, userId);

    analyticsService.trackMetric('template.generated_from_email', 1, {
      templateId: template.id,
      variableCount: variables.length
    });

    return template;
  }

  /**
   * Validate template
   */
  private validateTemplate(template: Partial<Template>): TemplateValidationResult {
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: TemplateValidationResult['warnings'] = [];

    if (!template.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!template.subject?.trim()) {
      errors.push({
        field: 'subject',
        message: 'Template subject is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!template.content?.trim()) {
      errors.push({
        field: 'content',
        message: 'Template content is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!template.category?.trim()) {
      warnings.push({
        field: 'category',
        message: 'Template category is recommended',
        code: 'MISSING_CATEGORY'
      });
    }

    // Validate variables
    if (template.variables) {
      const variableNames = new Set<string>();
      template.variables.forEach((variable, index) => {
        if (!variable.name?.trim()) {
          errors.push({
            field: `variables[${index}].name`,
            message: 'Variable name is required',
            code: 'INVALID_VARIABLE'
          });
        } else if (variableNames.has(variable.name)) {
          errors.push({
            field: `variables[${index}].name`,
            message: `Duplicate variable name: ${variable.name}`,
            code: 'DUPLICATE_VARIABLE'
          });
        } else {
          variableNames.add(variable.name);
        }

        if (variable.required && !variable.defaultValue) {
          warnings.push({
            field: `variables[${index}].defaultValue`,
            message: `Required variable "${variable.name}" has no default value`,
            code: 'MISSING_DEFAULT'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Export templates (client-side implementation)
   */
  public async exportTemplates(templateIds: string[], userId: string): Promise<Blob> {
    const templates = await Promise.all(
      templateIds.map(id => this.getTemplate(id))
    );

    const validTemplates = templates.filter((t): t is Template => t !== null);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      version: '1.0',
      templates: validTemplates.map(template => ({
        ...template,
        // Remove sensitive fields
        createdBy: template.isPublic ? template.createdBy : 'exported',
        permissions: []
      }))
    };

    analyticsService.trackMetric('template.exported', 1, {
      count: validTemplates.length,
      userId
    });

    return new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
  }

  /**
   * Import templates (client-side validation, then API calls)
   */
  public async importTemplates(file: File, userId: string): Promise<TemplateImportResult> {
    try {
      const content = await file.text();
      const data = JSON.parse(content);

      const result: TemplateImportResult = {
        success: true,
        imported: [],
        errors: [],
        duplicates: []
      };

      if (!data.templates || !Array.isArray(data.templates)) {
        result.success = false;
        result.errors.push('Invalid file format: templates array not found');
        return result;
      }

      // Get existing templates to check for duplicates
      const existingTemplates = await this.getTemplates(userId);
      const existingNames = new Set(existingTemplates.map(t => t.name));

      for (const templateData of data.templates) {
        try {
          // Check for duplicates by name
          if (existingNames.has(templateData.name)) {
            result.duplicates.push(templateData.name);
            continue;
          }

          // Create new template
          const template = await this.createTemplate({
            ...templateData,
            isPublic: false, // Imported templates are private by default
          }, userId);

          result.imported.push(template);
        } catch (error: any) {
          result.errors.push(`Failed to import "${templateData.name}": ${error.message}`);
        }
      }

      analyticsService.trackMetric('template.imported', 1, {
        totalCount: data.templates.length,
        importedCount: result.imported.length,
        errorCount: result.errors.length,
        duplicateCount: result.duplicates.length,
        userId
      });

      return result;
    } catch (error: any) {
      return {
        success: false,
        imported: [],
        errors: [`Failed to parse file: ${error.message}`],
        duplicates: []
      };
    }
  }
}

// Export singleton instance
export const emailTemplateServiceAPI = EmailTemplateServiceAPI.getInstance();