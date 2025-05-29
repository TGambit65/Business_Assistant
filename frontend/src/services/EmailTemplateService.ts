/**
 * Email Template Service
 * 
 * Handles CRUD operations for email templates
 */

import { Template, TemplateValidationResult, Variable } from '../../../shared/types/template';
import { LocalStorageService } from './LocalStorageService';
import { templateEngine } from './TemplateEngine';
import { analyticsService } from './AnalyticsService';

const STORAGE_KEY = 'email_templates';
const USER_TEMPLATES_KEY = 'user_templates';

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

export class EmailTemplateService {
  private static instance: EmailTemplateService;
  private localStorage: LocalStorageService;
  private templates: Map<string, Template> = new Map();

  private constructor() {
    this.localStorage = LocalStorageService.getInstance();
    this.loadTemplates();
  }

  public static getInstance(): EmailTemplateService {
    if (!EmailTemplateService.instance) {
      EmailTemplateService.instance = new EmailTemplateService();
    }
    return EmailTemplateService.instance;
  }

  /**
   * Get all templates for a user
   */
  public async getTemplates(userId: string): Promise<Template[]> {
    const userTemplates = Array.from(this.templates.values()).filter(
      template => template.createdBy === userId || template.isPublic
    );

    // Track template viewing
    analyticsService.trackMetric('template.list_viewed', 1, { 
      userId,
      count: userTemplates.length 
    });

    return userTemplates.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get template by ID
   */
  public async getTemplate(templateId: string): Promise<Template | null> {
    const template = this.templates.get(templateId);
    
    if (template) {
      analyticsService.trackMetric('template.viewed', 1, { 
        templateId,
        category: template.category 
      });
    }

    return template || null;
  }

  /**
   * Create a new template
   */
  public async createTemplate(
    templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
    userId: string
  ): Promise<Template> {
    const template: Template = {
      ...templateData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      version: 1,
    };

    // Validate template
    const validationResult = this.validateTemplate(template);
    if (!validationResult.isValid) {
      throw new Error(`Template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    this.templates.set(template.id, template);
    this.saveTemplates();

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
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check permissions
    if (existingTemplate.createdBy !== userId) {
      throw new Error('Permission denied: Cannot update template created by another user');
    }

    const updatedTemplate: Template = {
      ...existingTemplate,
      ...updates,
      id: templateId, // Prevent ID changes
      updatedAt: new Date(),
      version: existingTemplate.version + 1,
      createdBy: existingTemplate.createdBy, // Prevent createdBy changes
      createdAt: existingTemplate.createdAt, // Prevent createdAt changes
    };

    // Validate updated template
    const validationResult = this.validateTemplate(updatedTemplate);
    if (!validationResult.isValid) {
      throw new Error(`Template validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    this.templates.set(templateId, updatedTemplate);
    this.saveTemplates();

    analyticsService.trackMetric('template.updated', 1, {
      templateId,
      category: updatedTemplate.category,
      version: updatedTemplate.version
    });

    return updatedTemplate;
  }

  /**
   * Delete a template
   */
  public async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check permissions
    if (template.createdBy !== userId) {
      throw new Error('Permission denied: Cannot delete template created by another user');
    }

    this.templates.delete(templateId);
    this.saveTemplates();

    analyticsService.trackMetric('template.deleted', 1, {
      templateId,
      category: template.category
    });
  }

  /**
   * Duplicate a template
   */
  public async duplicateTemplate(templateId: string, userId: string): Promise<Template> {
    const original = this.templates.get(templateId);
    if (!original) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const duplicate: Template = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      version: 1,
      isPublic: false, // Duplicates are private by default
    };

    this.templates.set(duplicate.id, duplicate);
    this.saveTemplates();

    analyticsService.trackMetric('template.duplicated', 1, {
      originalId: templateId,
      duplicateId: duplicate.id,
      category: duplicate.category
    });

    return duplicate;
  }

  /**
   * Search templates
   */
  public async searchTemplates(
    criteria: TemplateSearchCriteria,
    userId: string
  ): Promise<Template[]> {
    let results = Array.from(this.templates.values());

    // Filter by user access
    results = results.filter(template => 
      template.createdBy === userId || template.isPublic
    );

    // Apply search criteria
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
      );
    }

    if (criteria.category) {
      results = results.filter(template => 
        template.category === criteria.category
      );
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(template =>
        criteria.tags!.some(tag => template.tags.includes(tag))
      );
    }

    if (criteria.isPublic !== undefined) {
      results = results.filter(template => 
        template.isPublic === criteria.isPublic
      );
    }

    if (criteria.createdBy) {
      results = results.filter(template => 
        template.createdBy === criteria.createdBy
      );
    }

    analyticsService.trackMetric('template.searched', 1, {
      query: criteria.query,
      category: criteria.category,
      resultCount: results.length
    });

    return results.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get template categories
   */
  public getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(template => {
      if (template.category) {
        categories.add(template.category);
      }
    });
    return Array.from(categories).sort();
  }

  /**
   * Get all tags
   */
  public getTags(): string[] {
    const tags = new Set<string>();
    this.templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Export templates
   */
  public async exportTemplates(templateIds: string[], userId: string): Promise<Blob> {
    const templates = templateIds
      .map(id => this.templates.get(id))
      .filter((template): template is Template => 
        template !== undefined && (template.createdBy === userId || template.isPublic)
      );

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      version: '1.0',
      templates: templates.map(template => ({
        ...template,
        // Remove sensitive fields
        createdBy: template.isPublic ? template.createdBy : 'exported',
        permissions: []
      }))
    };

    analyticsService.trackMetric('template.exported', 1, {
      count: templates.length,
      userId
    });

    return new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
  }

  /**
   * Import templates
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

      for (const templateData of data.templates) {
        try {
          // Check for duplicates by name
          const existing = Array.from(this.templates.values()).find(
            t => t.name === templateData.name && t.createdBy === userId
          );

          if (existing) {
            result.duplicates.push(templateData.name);
            continue;
          }

          // Create new template
          const template = await this.createTemplate({
            ...templateData,
            createdBy: userId,
            isPublic: false, // Imported templates are private by default
          }, userId);

          result.imported.push(template);
        } catch (error) {
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
    } catch (error) {
      return {
        success: false,
        imported: [],
        errors: [`Failed to parse file: ${error.message}`],
        duplicates: []
      };
    }
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
      uniqueVars.forEach((varName, index) => {
        variables.push({
          id: this.generateId(),
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
  private validateTemplate(template: Template): TemplateValidationResult {
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
   * Get templates by language
   */
  public async getTemplatesByLanguage(userId: string, language: string): Promise<Template[]> {
    const allTemplates = await this.getTemplates(userId);
    return allTemplates.filter(template => 
      template.metadata.language === language || 
      (!template.metadata.language && language === 'en') // Default to English if no language specified
    );
  }

  /**
   * Create default language-specific templates
   */
  public async createDefaultLanguageTemplates(): Promise<void> {
    const defaultTemplates = this.getDefaultTemplatesByLanguage();
    
    for (const template of defaultTemplates) {
      // Only create if template doesn't already exist
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    }
    
    this.saveTemplates();
  }

  /**
   * Get default templates for all supported languages
   */
  private getDefaultTemplatesByLanguage(): Template[] {
    const now = new Date();
    const systemUserId = 'system';
    
    const templates: Template[] = [];
    
    // English Templates
    templates.push({
      id: 'welcome_email_en',
      name: 'Welcome Email (English)',
      subject: 'Welcome to {{company_name}}!',
      content: `Dear {{user_name}},

Welcome to {{company_name}}! We're thrilled to have you join our community.

Here's what you can expect:
- Excellent customer service
- Regular updates and news
- Access to exclusive features

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
The {{company_name}} Team`,
      variables: [
        { id: 'user_name', name: 'User Name', type: 'name', required: true, description: 'Name of the user' },
        { id: 'company_name', name: 'Company Name', type: 'text', required: true, description: 'Name of the company' }
      ],
      aiSuggestions: true,
      category: 'welcome',
      permissions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId,
      version: 1,
      isPublic: true,
      tags: ['welcome', 'onboarding'],
      metadata: {
        language: 'en',
        description: 'Standard welcome email template',
        useCase: 'user_onboarding'
      }
    });

    // Spanish Templates
    templates.push({
      id: 'welcome_email_es',
      name: 'Correo de Bienvenida (Español)',
      subject: '¡Bienvenido a {{company_name}}!',
      content: `Estimado {{user_name}},

¡Bienvenido a {{company_name}}! Nos emociona tenerte en nuestra comunidad.

Esto es lo que puedes esperar:
- Excelente servicio al cliente
- Actualizaciones y noticias regulares
- Acceso a funciones exclusivas

Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.

Saludos cordiales,
El equipo de {{company_name}}`,
      variables: [
        { id: 'user_name', name: 'Nombre del Usuario', type: 'name', required: true, description: 'Nombre del usuario' },
        { id: 'company_name', name: 'Nombre de la Empresa', type: 'text', required: true, description: 'Nombre de la empresa' }
      ],
      aiSuggestions: true,
      category: 'welcome',
      permissions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId,
      version: 1,
      isPublic: true,
      tags: ['bienvenida', 'incorporación'],
      metadata: {
        language: 'es',
        description: 'Plantilla estándar de correo de bienvenida',
        useCase: 'user_onboarding'
      }
    });

    // French Templates
    templates.push({
      id: 'welcome_email_fr',
      name: 'Email de Bienvenue (Français)',
      subject: 'Bienvenue chez {{company_name}}!',
      content: `Cher {{user_name}},

Bienvenue chez {{company_name}}! Nous sommes ravis de vous accueillir dans notre communauté.

Voici ce que vous pouvez attendre:
- Un excellent service client
- Des mises à jour et nouvelles régulières
- Accès à des fonctionnalités exclusives

Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.

Cordialement,
L'équipe {{company_name}}`,
      variables: [
        { id: 'user_name', name: 'Nom de l\'utilisateur', type: 'name', required: true, description: 'Nom de l\'utilisateur' },
        { id: 'company_name', name: 'Nom de l\'entreprise', type: 'text', required: true, description: 'Nom de l\'entreprise' }
      ],
      aiSuggestions: true,
      category: 'welcome',
      permissions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId,
      version: 1,
      isPublic: true,
      tags: ['bienvenue', 'intégration'],
      metadata: {
        language: 'fr',
        description: 'Modèle d\'email de bienvenue standard',
        useCase: 'user_onboarding'
      }
    });

    // Arabic Template (RTL)
    templates.push({
      id: 'welcome_email_ar',
      name: 'رسالة ترحيب (العربية)',
      subject: 'مرحباً بك في {{company_name}}!',
      content: `عزيزي {{user_name}}،

مرحباً بك في {{company_name}}! نحن متحمسون لانضمامك إلى مجتمعنا.

إليك ما يمكنك توقعه:
- خدمة عملاء ممتازة
- تحديثات وأخبار منتظمة
- الوصول إلى ميزات حصرية

إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم لدينا.

مع أطيب التحيات،
فريق {{company_name}}`,
      variables: [
        { id: 'user_name', name: 'اسم المستخدم', type: 'name', required: true, description: 'اسم المستخدم' },
        { id: 'company_name', name: 'اسم الشركة', type: 'text', required: true, description: 'اسم الشركة' }
      ],
      aiSuggestions: true,
      category: 'welcome',
      permissions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId,
      version: 1,
      isPublic: true,
      tags: ['ترحيب', 'تسجيل'],
      metadata: {
        language: 'ar',
        description: 'قالب رسالة ترحيب قياسية',
        useCase: 'user_onboarding'
      }
    });

    return templates;
  }

  /**
   * Load templates from storage
   */
  private loadTemplates(): void {
    try {
      const storedTemplates = this.localStorage.getItem<Template[]>(STORAGE_KEY);
      if (storedTemplates) {
        storedTemplates.forEach(template => {
          // Convert date strings back to Date objects
          template.createdAt = new Date(template.createdAt);
          template.updatedAt = new Date(template.updatedAt);
          this.templates.set(template.id, template);
        });
      }
      
      // Create default language-specific templates if none exist
      if (this.templates.size === 0) {
        this.createDefaultLanguageTemplates();
      }
    } catch (error) {
      console.error('Failed to load templates from storage:', error);
    }
  }

  /**
   * Save templates to storage
   */
  private saveTemplates(): void {
    try {
      const templatesArray = Array.from(this.templates.values());
      this.localStorage.setItem(STORAGE_KEY, templatesArray);
    } catch (error) {
      console.error('Failed to save templates to storage:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const emailTemplateService = EmailTemplateService.getInstance();