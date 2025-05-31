import { Template, TemplateContext, AISuggestion, TemplateValidationResult, Variable } from '../../../shared/types/template';
import { SecurityManager } from '../security/SecurityManager';
import { analyticsService as AnalyticsService } from './AnalyticsService';
import DeepseekService from './DeepseekService';
import { AIRequestContext } from '../types/deepseek';
import { defaultPreferences } from '../types/preferences';

/**
 * Template Engine Dependencies
 */
export interface TemplateEngineDependencies {
  analyticsService: any;
  deepseekService: any;
  securityManager: any;
}

export class TemplateEngine {
  private templates: Map<string, Template> = new Map();
  private securityManager: any;
  private analyticsService: any;
  private deepseekService: any;

  constructor(dependencies: TemplateEngineDependencies) {
    this.securityManager = dependencies.securityManager;
    this.analyticsService = dependencies.analyticsService;
    this.deepseekService = dependencies.deepseekService;
  }

  public async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Template> {
    // Validate template
    const validationResult = this.validateTemplate(template);
    if (!validationResult.isValid) {
      throw new Error(`Invalid template: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Sanitize template content
    const sanitizedTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      content: this.securityManager.sanitizeInput(template.content),
      variables: template.variables.map(v => ({
        ...v,
        defaultValue: v.defaultValue ? this.securityManager.sanitizeInput(v.defaultValue) : undefined
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    // Store template
    this.templates.set(sanitizedTemplate.id, sanitizedTemplate);

    // Track template creation
    this.analyticsService.trackMetric('template.created', 1, {
      templateId: sanitizedTemplate.id,
      category: sanitizedTemplate.category
    });

    return sanitizedTemplate;
  }

  public async generateDynamicContent(templateId: string, context: TemplateContext): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate context
    const validationResult = this.validateContext(template, context);
    if (!validationResult.isValid) {
      throw new Error(`Invalid context: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Generate content with AI suggestions
    const aiSuggestions = await this.getAISuggestions(template, context);
    let content = template.content;

    // Replace variables
    for (const variable of template.variables) {
      const value = context.variables[variable.name] || variable.defaultValue;
      if (variable.required && !value) {
        throw new Error(`Required variable ${variable.name} is missing`);
      }
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), value || '');
    }

    // Apply AI suggestions
    for (const suggestion of aiSuggestions) {
      if (suggestion.suggestedChanges.content) {
        content = content.replace(suggestion.description, suggestion.suggestedChanges.content);
      }
    }

    // Track template usage
    this.analyticsService.trackMetric('template.used', 1, {
      templateId,
      category: template.category
    });

    return content;
  }

  public async getAISuggestions(template: Template, _context: TemplateContext): Promise<AISuggestion[]> {
    if (!template.aiSuggestions) {
      return [];
    }

    // Create AI request context
    const aiContext: AIRequestContext = {
      systemPrompt: `Generate suggestions for the following template: ${template.name}`,
      userHistory: [],
      userPreferences: defaultPreferences
    };

    // Get AI suggestions
    const response = await this.deepseekService.generateEmailDraft(aiContext);
    
    // Transform AI response into AISuggestion format
    return [{
      id: crypto.randomUUID(),
      type: 'content',
      description: response.content,
      confidence: response.metadata.confidence,
      suggestedChanges: {
        content: response.content
      },
      reasoning: response.metadata.suggestions?.join(', ') || '',
      createdAt: new Date()
    }];
  }

  private validateTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>): TemplateValidationResult {
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: TemplateValidationResult['warnings'] = [];

    if (!template.name) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!template.content) {
      errors.push({
        field: 'content',
        message: 'Template content is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!template.category) {
      errors.push({
        field: 'category',
        message: 'Template category is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (template.variables) {
      for (const variable of template.variables) {
        if (!variable.name) {
          errors.push({
            field: 'variables',
            message: 'Variable name is required',
            code: 'INVALID_VARIABLE'
          });
        }

        if (variable.required && !variable.defaultValue) {
          warnings.push({
            field: 'variables',
            message: `Required variable ${variable.name} has no default value`,
            code: 'MISSING_DEFAULT'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateContext(template: Template, context: TemplateContext): TemplateValidationResult {
    const errors: TemplateValidationResult['errors'] = [];
    const warnings: TemplateValidationResult['warnings'] = [];

    if (!context.variables) {
      errors.push({
        field: 'variables',
        message: 'Context variables are required',
        code: 'REQUIRED_FIELD'
      });
    } else {
      for (const variable of template.variables) {
        if (variable.required) {
          const value = context.variables[variable.name];
          if (!value) {
            errors.push({
              field: `variables.${variable.name}`,
              message: `Required variable ${variable.name} is missing`,
              code: 'MISSING_REQUIRED_VARIABLE'
            });
          } else if (variable.validation) {
            // Validate value against rules
            if (variable.validation.pattern && !new RegExp(variable.validation.pattern).test(value)) {
              errors.push({
                field: `variables.${variable.name}`,
                message: `Value for ${variable.name} does not match required pattern`,
                code: 'INVALID_PATTERN'
              });
            }

            if (variable.validation.min !== undefined && Number(value) < variable.validation.min) {
              errors.push({
                field: `variables.${variable.name}`,
                message: `Value for ${variable.name} is below minimum`,
                code: 'BELOW_MIN'
              });
            }

            if (variable.validation.max !== undefined && Number(value) > variable.validation.max) {
              errors.push({
                field: `variables.${variable.name}`,
                message: `Value for ${variable.name} is above maximum`,
                code: 'ABOVE_MAX'
              });
            }

            if (variable.validation.custom && !variable.validation.custom(value)) {
              errors.push({
                field: `variables.${variable.name}`,
                message: `Value for ${variable.name} failed custom validation`,
                code: 'CUSTOM_VALIDATION_FAILED'
              });
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export a singleton instance
export const templateEngine = new TemplateEngine({
  analyticsService: AnalyticsService,
  deepseekService: DeepseekService,
  securityManager: SecurityManager.getInstance()
}); 