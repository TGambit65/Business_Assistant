/**
 * AIEmailService.ts
 * 
 * A unified service for AI-powered email functionality including:
 * - Draft generation
 * - Content improvement
 * - Reply suggestions
 * - Email summarization
 * - Content rewriting
 * 
 * This service consolidates functionality from:
 * - AIDraftGenerator
 * - AIComposeAssistant
 * - DraftGeneratorPage
 */

import { 
  DraftContext, 
  Draft, 
  Suggestion, 
  ImprovedDraft
} from '../types/draft';
import { 
  AIRequestContext, 
  Message, 
  AIAnalysis 
} from '../types/deepseek';
import { UserPreferences, defaultPreferences } from '../types/preferences';
import { Email } from '../types/email';
import { ContentTone, ContentLength } from '../types/ai';
import { SecurityManager } from '../security/SecurityManager';
import deepseekService from './DeepseekService';
import { analyticsService } from './AnalyticsService';
import { getCurrentLanguage } from '../i18n';
import { detectLanguage, getLanguageDisplayName } from '../utils/languageDetection';

// Configuration interface for the service
export interface AIEmailServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  rateLimit: {
    requestsPerMinute: number;
    maxTokensPerDay: number;
  };
  security: {
    contentFiltering: boolean;
    sensitiveDataDetection: boolean;
  };
}

// Interface for compose options
export interface ComposeOptions {
  prompt: string;
  style: ContentTone;
  length: ContentLength;
  language?: string; // Optional language code for generated content
}

// Interface for rewrite options
export interface RewriteOptions {
  text: string;
  tone: ContentTone;
  language?: string; // Optional target language for rewritten content
}

// Interface for reply options
export interface ReplyOptions {
  originalEmail: Email | string;
  replyType: 'normal' | 'positive' | 'negative' | 'request-info' | 'follow-up';
  points?: string;
  language?: string; // Optional language for reply generation
}

// Interface for summarize options
export interface SummarizeOptions {
  content: string;
  length?: ContentLength;
}

/**
 * AIEmailService class
 * 
 * Provides a unified interface for all AI email functionality
 */
export class AIEmailService {
  private static instance: AIEmailService;
  private securityManager: SecurityManager;
  private aiService: typeof deepseekService;
  private config: AIEmailServiceConfig;
  private requestTimestamps: number[] = [];
  private dailyTokenCount: number = 0;
  private lastTokenReset: number = Date.now();

  private constructor() {
    this.securityManager = SecurityManager.getInstance();
    this.aiService = deepseekService;
    this.config = {
      model: 'deepseek-chat',
      maxTokens: 2000,
      temperature: 0.7,
      rateLimit: {
        requestsPerMinute: 60,
        maxTokensPerDay: 100000
      },
      security: {
        contentFiltering: true,
        sensitiveDataDetection: true
      }
    };
  }

  /**
   * Get the singleton instance of AIEmailService
   */
  public static getInstance(): AIEmailService {
    if (!AIEmailService.instance) {
      AIEmailService.instance = new AIEmailService();
    }
    return AIEmailService.instance;
  }

  /**
   * Configure the service
   * @param config Configuration options
   */
  public configure(config: Partial<AIEmailServiceConfig>): void {
    // Validate the input configuration
    const validatedConfig = this.validateConfiguration(config);
    
    this.config = {
      ...this.config,
      ...validatedConfig
    };
  }

  /**
   * Validate configuration values before merging
   * @param config Configuration options to validate
   * @returns Validated configuration
   */
  private validateConfiguration(config: Partial<AIEmailServiceConfig>): Partial<AIEmailServiceConfig> {
    const validatedConfig: Partial<AIEmailServiceConfig> = {};

    // Validate model
    if (config.model !== undefined) {
      if (typeof config.model !== 'string' || config.model.trim().length === 0) {
        throw new Error('Invalid configuration: model must be a non-empty string');
      }
      validatedConfig.model = config.model.trim();
    }

    // Validate maxTokens
    if (config.maxTokens !== undefined) {
      if (typeof config.maxTokens !== 'number' || config.maxTokens <= 0 || !Number.isInteger(config.maxTokens)) {
        throw new Error('Invalid configuration: maxTokens must be a positive integer');
      }
      if (config.maxTokens > 100000) {
        console.warn('Warning: maxTokens is very high. Consider using a smaller value.');
      }
      validatedConfig.maxTokens = config.maxTokens;
    }

    // Validate temperature
    if (config.temperature !== undefined) {
      if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
        throw new Error('Invalid configuration: temperature must be a number between 0 and 2');
      }
      validatedConfig.temperature = config.temperature;
    }

    // Validate rateLimit
    if (config.rateLimit !== undefined) {
      if (typeof config.rateLimit !== 'object' || config.rateLimit === null) {
        throw new Error('Invalid configuration: rateLimit must be an object');
      }

      const validatedRateLimit: Partial<AIEmailServiceConfig['rateLimit']> = {};

      // Validate requestsPerMinute
      if (config.rateLimit.requestsPerMinute !== undefined) {
        if (typeof config.rateLimit.requestsPerMinute !== 'number' || 
            config.rateLimit.requestsPerMinute <= 0 || 
            !Number.isInteger(config.rateLimit.requestsPerMinute)) {
          throw new Error('Invalid configuration: rateLimit.requestsPerMinute must be a positive integer');
        }
        if (config.rateLimit.requestsPerMinute > 1000) {
          console.warn('Warning: requestsPerMinute is very high. Consider using a smaller value.');
        }
        validatedRateLimit.requestsPerMinute = config.rateLimit.requestsPerMinute;
      }

      // Validate maxTokensPerDay
      if (config.rateLimit.maxTokensPerDay !== undefined) {
        if (typeof config.rateLimit.maxTokensPerDay !== 'number' || 
            config.rateLimit.maxTokensPerDay <= 0 || 
            !Number.isInteger(config.rateLimit.maxTokensPerDay)) {
          throw new Error('Invalid configuration: rateLimit.maxTokensPerDay must be a positive integer');
        }
        validatedRateLimit.maxTokensPerDay = config.rateLimit.maxTokensPerDay;
      }

      // Only set rateLimit if we have valid properties
      if (Object.keys(validatedRateLimit).length > 0) {
        validatedConfig.rateLimit = validatedRateLimit as AIEmailServiceConfig['rateLimit'];
      }
    }

    // Validate security
    if (config.security !== undefined) {
      if (typeof config.security !== 'object' || config.security === null) {
        throw new Error('Invalid configuration: security must be an object');
      }

      const validatedSecurity: Partial<AIEmailServiceConfig['security']> = {};

      // Validate contentFiltering
      if (config.security.contentFiltering !== undefined) {
        if (typeof config.security.contentFiltering !== 'boolean') {
          throw new Error('Invalid configuration: security.contentFiltering must be a boolean');
        }
        validatedSecurity.contentFiltering = config.security.contentFiltering;
      }

      // Validate sensitiveDataDetection
      if (config.security.sensitiveDataDetection !== undefined) {
        if (typeof config.security.sensitiveDataDetection !== 'boolean') {
          throw new Error('Invalid configuration: security.sensitiveDataDetection must be a boolean');
        }
        validatedSecurity.sensitiveDataDetection = config.security.sensitiveDataDetection;
      }

      // Only set security if we have valid properties
      if (Object.keys(validatedSecurity).length > 0) {
        validatedConfig.security = validatedSecurity as AIEmailServiceConfig['security'];
      }
    }

    return validatedConfig;
  }

  /**
   * Generate a complete email draft based on context
   * @param context The context for draft generation
   * @returns A complete draft
   */
  public async generateDraft(context: DraftContext): Promise<Draft> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize context
    const sanitizedContext = this.sanitizeContext(context);

    // Create AI request context
    const aiContext: AIRequestContext = {
      systemPrompt: this.buildSystemPrompt(sanitizedContext),
      userHistory: this.buildUserHistory(sanitizedContext),
      userPreferences: sanitizedContext.userPreferences || this.getDefaultUserPreferences()
    };

    // Generate draft
    const startTime = Date.now();
    const response = await this.aiService.generateEmailDraft(aiContext);
    const processingTime = Date.now() - startTime;

    // Process response
    const draft: Draft = {
      id: crypto.randomUUID(),
      subject: this.extractSubject(response.content),
      content: this.extractContent(response.content),
      context: sanitizedContext,
      metadata: {
        generatedAt: new Date(),
        model: this.config.model,
        confidence: response.metadata.confidence,
        tokensUsed: response.metadata.length,
        processingTime,
        suggestions: []
      },
      status: 'draft',
      version: 1,
      history: [{
        timestamp: new Date(),
        action: 'created',
        userId: context.userPreferences?.email?.defaultSignature || 'system'
      }]
    };

    // Update metrics
    this.updateMetrics(response.metadata.length);

    // Track analytics
    analyticsService.trackMetric('draft.generated', 1, {
      draftId: draft.id,
      model: this.config.model,
      processingTime: processingTime.toString()
    });

    return draft;
  }

  /**
   * Generate content based on a prompt
   * @param options Options for composition
   * @returns Generated content
   */
  public async composeContent(options: ComposeOptions & { language?: string }): Promise<string> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize input
    const sanitizedPrompt = this.securityManager.sanitizeInput(options.prompt);
    
    // Get current language or use provided language
    const targetLanguage = options.language || getCurrentLanguage();
    const languageName = getLanguageDisplayName(targetLanguage);

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: `Generate an email in ${languageName} with the following characteristics:
          Style: ${options.style}
          Length: ${options.length}
          Language: ${languageName} (${targetLanguage})
          
          The email should be well-structured, professional, culturally appropriate for the target language, and address the following prompt:
          ${sanitizedPrompt}
          
          Important: The entire response must be in ${languageName}. Use proper grammar, spelling, and cultural conventions for ${languageName}.`,
        userHistory: [{
          role: 'user' as const,
          content: sanitizedPrompt
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Generate content
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);

      return response.content;
    } catch (error) {
      console.error('Error generating email content:', error);
      throw new Error('Failed to generate email content. Please try again.');
    }
  }

  /**
   * Rewrite existing text with a different tone
   * @param options Options for rewriting
   * @returns Rewritten content
   */
  public async rewriteContent(options: RewriteOptions): Promise<string> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize input
    const sanitizedText = this.securityManager.sanitizeInput(options.text);
    
    // Get current language or use provided language
    const targetLanguage = options.language || getCurrentLanguage();
    const languageName = getLanguageDisplayName(targetLanguage);

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: `Rewrite the following text with a ${options.tone} tone in ${languageName}. 
          Maintain the original meaning and key points, but adjust the language, 
          style, and phrasing to match the requested tone. Ensure the rewritten text 
          is culturally appropriate and natural in ${languageName}.`,
        userHistory: [{
          role: 'user' as const,
          content: sanitizedText
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Generate rewritten content
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);

      return response.content;
    } catch (error) {
      console.error('Error rewriting content:', error);
      throw new Error('Failed to rewrite content. Please try again.');
    }
  }

  /**
   * Translate email content to a different language
   * @param text Text to translate
   * @param targetLanguage Target language code
   * @param sourceLanguage Source language code (optional, will be auto-detected)
   * @returns Translated content
   */
  public async translateContent(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize input
    const sanitizedText = this.securityManager.sanitizeInput(text);
    
    // Detect source language if not provided
    const detectedSourceLanguage = sourceLanguage || detectLanguage(sanitizedText);
    const sourceLanguageName = getLanguageDisplayName(detectedSourceLanguage);
    const targetLanguageName = getLanguageDisplayName(targetLanguage);

    // Don't translate if source and target are the same
    if (detectedSourceLanguage === targetLanguage) {
      return sanitizedText;
    }

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}.
          
          Guidelines:
          - Maintain the original tone and style
          - Preserve formatting and structure
          - Use culturally appropriate language for the target audience
          - Keep technical terms and proper nouns accurate
          - Ensure the translation is natural and fluent in ${targetLanguageName}
          
          Original text (${sourceLanguageName}):
          ${sanitizedText}
          
          Please provide only the translation in ${targetLanguageName}, without any additional commentary.`,
        userHistory: [{
          role: 'user' as const,
          content: `Translate to ${targetLanguageName}: ${sanitizedText}`
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Generate translation
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);

      // Track analytics
      analyticsService.trackMetric('translation.generated', 1, {
        sourceLanguage: detectedSourceLanguage,
        targetLanguage,
        textLength: sanitizedText.length.toString()
      });

      return response.content;
    } catch (error) {
      console.error('Error translating content:', error);
      throw new Error('Failed to translate content. Please try again.');
    }
  }

  /**
   * Generate a reply to an email
   * @param options Options for reply generation
   * @returns Generated reply content
   */
  public async generateReply(options: ReplyOptions): Promise<string> {
    // Check rate limits
    this.checkRateLimits();

    // Extract email content if an Email object was provided
    const originalContent = typeof options.originalEmail === 'string' 
      ? options.originalEmail 
      : options.originalEmail.body;

    // Sanitize input
    const sanitizedContent = this.securityManager.sanitizeInput(originalContent);
    const sanitizedPoints = options.points ? this.securityManager.sanitizeInput(options.points) : '';
    
    // Get current language or use provided language
    const targetLanguage = options.language || getCurrentLanguage();
    const languageName = getLanguageDisplayName(targetLanguage);

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: `Generate a ${options.replyType} reply to the following email in ${languageName}.
          ${options.points ? `Make sure to address these points: ${sanitizedPoints}` : ''}
          The reply should be professional, concise, culturally appropriate for ${languageName}, and directly address the content of the original email.`,
        userHistory: [{
          role: 'user' as const,
          content: `Original email: ${sanitizedContent}
          ${options.points ? `Points to address: ${sanitizedPoints}` : ''}`
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Generate reply
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);

      return response.content;
    } catch (error) {
      console.error('Error generating reply:', error);
      throw new Error('Failed to generate reply. Please try again.');
    }
  }

  /**
   * Summarize email content
   * @param options Options for summarization
   * @returns Summarized content
   */
  public async summarizeContent(options: SummarizeOptions): Promise<string> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize input
    const sanitizedContent = this.securityManager.sanitizeInput(options.content);

    // Determine length modifier
    const lengthModifier = options.length || 'short';
    
    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: `Summarize the following email content into a ${lengthModifier} summary.
          Extract the key points, main message, and any action items or requests.`,
        userHistory: [{
          role: 'user' as const,
          content: sanitizedContent
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Generate summary
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);

      return response.content;
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw new Error('Failed to summarize content. Please try again.');
    }
  }

  /**
   * Provide suggestions for improving an email draft
   * @param content The current content
   * @returns Array of suggestions
   */
  public async provideSuggestions(content: string): Promise<Suggestion[]> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize content
    const sanitizedContent = this.securityManager.sanitizeInput(content);

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: 'Analyze the following email content and provide suggestions for improvement.',
        userHistory: [{
          role: 'user' as const,
          content: sanitizedContent
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Get suggestions
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Process suggestions
      const suggestions: Suggestion[] = this.parseSuggestions(response.content);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);
      
      return suggestions;
    } catch (error) {
      console.error('Error providing suggestions:', error);
      return [];
    }
  }

  /**
   * Improve an existing draft
   * @param draft The draft to improve
   * @returns An improved version of the draft
   */
  public async improveContent(draft: Draft): Promise<ImprovedDraft> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize content
    const sanitizedContent = this.securityManager.sanitizeInput(draft.content);

    try {
      // Create AI request context
      const aiContext: AIRequestContext = {
        systemPrompt: 'Improve the following email content for better clarity, tone, and grammar.',
        userHistory: [{
          role: 'user' as const,
          content: sanitizedContent
        }],
        userPreferences: draft.context.userPreferences || this.getDefaultUserPreferences()
      };

      // Get improved content
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Process improvements
      const improvements = this.parseImprovements(response.content);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(response.content);
      
      // Get suggestions for the improved content (this method now has its own error handling)
      const suggestions = await this.provideSuggestions(response.content);
      
      // Create improved draft
      const improvedDraft: ImprovedDraft = {
        ...draft,
        content: response.content,
        improvements,
        metrics,
        suggestions,
        version: draft.version + 1,
        history: [
          ...draft.history,
          {
            timestamp: new Date(),
            action: 'edited',
            userId: draft.context.userPreferences?.email?.defaultSignature || 'system',
            changes: [{
              field: 'content',
              oldValue: draft.content,
              newValue: response.content
            }]
          }
        ]
      };

      // Update metrics
      this.updateMetrics(response.metadata.length);

      return improvedDraft;
    } catch (error) {
      console.error('Error improving content:', error);
      throw new Error('Failed to improve content. Please try again.');
    }
  }

  /**
   * Generate continuation suggestions for text
   * @param text The text to continue
   * @param count Number of suggestions to generate
   * @returns Array of continuation suggestions
   */
  public async generateContinuationSuggestions(text: string, count: number = 5): Promise<string[]> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize input
    const sanitizedText = this.securityManager.sanitizeInput(text);

    try {
      // Create AI request context for suggestions
      const aiContext: AIRequestContext = {
        systemPrompt: `Provide ${count} concise, helpful continuation suggestions for the following text input.`,
        userHistory: [{
          role: 'user' as const,
          content: `Generate suggestions for continuing this text: "${sanitizedText}"`
        }],
        userPreferences: this.getDefaultUserPreferences()
      };

      // Get suggestions
      const response = await this.aiService.generateEmailDraft(aiContext);
      
      // Parse response to get suggestions array
      const suggestions = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[0-9]+\.\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0)
        .slice(0, count);
      
      // Update metrics
      this.updateMetrics(response.metadata.length);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating continuation suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze the tone of an email
   * @param email The email to analyze
   * @returns Analysis results
   */
  public async analyzeEmailTone(email: Email | string): Promise<AIAnalysis> {
    // Extract content if an Email object was provided
    const content = typeof email === 'string' ? email : email.body;
    
    // Use the DeepseekService directly for analysis
    if (typeof email === 'string') {
      const mockEmail: Email = {
        id: 'temp-id',
        from: { email: 'sender@example.com' },
        to: [{ email: 'recipient@example.com' }],
        subject: 'Analysis Request',
        body: content,
        timestamp: new Date(),
        isRead: true,
        isStarred: false,
        isArchived: false
      };
      return this.aiService.analyzeEmailTone(mockEmail);
    } else {
      return this.aiService.analyzeEmailTone(email);
    }
  }

  // Private helper methods

  /**
   * Check rate limits and throw an error if exceeded
   */
  private checkRateLimits(): void {
    const now = Date.now();
    
    // Check requests per minute using sliding window
    // Remove timestamps older than 60 seconds
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < 60000);
    
    // Check if we're about to exceed the rate limit
    if (this.requestTimestamps.length >= this.config.rateLimit.requestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Add current request timestamp
    this.requestTimestamps.push(now);
    
    // Check tokens per day
    if (now - this.lastTokenReset > 86400000) {
      this.lastTokenReset = now;
      this.dailyTokenCount = 0;
    }
    
    if (this.dailyTokenCount > this.config.rateLimit.maxTokensPerDay) {
      throw new Error('Daily token limit exceeded. Please try again tomorrow.');
    }
  }

  /**
   * Update metrics after a request
   * @param tokensUsed Number of tokens used
   */
  private updateMetrics(tokensUsed: number): void {
    this.dailyTokenCount += tokensUsed;
    
    // Track analytics
    analyticsService.trackMetric('ai.tokens.used', tokensUsed);
  }

  /**
   * Sanitize the draft context
   * @param context The context to sanitize
   * @returns Sanitized context
   */
  private sanitizeContext(context: DraftContext): DraftContext {
    return {
      ...context,
      recipient: {
        ...context.recipient,
        email: this.securityManager.sanitizeInput(context.recipient.email),
        name: context.recipient.name ? this.securityManager.sanitizeInput(context.recipient.name) : undefined,
        role: context.recipient.role ? this.securityManager.sanitizeInput(context.recipient.role) : undefined,
        company: context.recipient.company ? this.securityManager.sanitizeInput(context.recipient.company) : undefined
      },
      purpose: this.securityManager.sanitizeInput(context.purpose),
      keyPoints: context.keyPoints.map(point => this.securityManager.sanitizeInput(point)),
      cc: context.cc?.map(email => this.securityManager.sanitizeInput(email)),
      bcc: context.bcc?.map(email => this.securityManager.sanitizeInput(email))
    };
  }

  /**
   * Build a system prompt from context
   * @param context The draft context
   * @returns System prompt string
   */
  private buildSystemPrompt(context: DraftContext): string {
    return `Generate a professional email with the following context:
    Recipient: ${context.recipient.name || context.recipient.email}
    Purpose: ${context.purpose}
    Tone: ${context.tone}
    Key Points: ${context.keyPoints.join(', ')}
    ${context.deadline ? `Deadline: ${context.deadline.toISOString()}` : ''}
    ${context.priority ? `Priority: ${context.priority}` : ''}
    ${context.followUp ? 'This is a follow-up email.' : ''}`;
  }

  /**
   * Build user history from context
   * @param context The draft context
   * @returns Array of messages
   */
  private buildUserHistory(context: DraftContext): Message[] {
    const messages: Message[] = [
      {
        role: 'user',
        content: `Generate an email to ${context.recipient.name || context.recipient.email} about ${context.purpose}.
        Key points to include:
        ${context.keyPoints.map(point => `- ${point}`).join('\n')}
        ${context.previousCommunication ? `
        Previous communication:
        ${context.previousCommunication.map(comm => `${comm.date.toLocaleDateString()}: ${comm.content}`).join('\n')}
        ` : ''}`
      }
    ];
    
    return messages;
  }

  /**
   * Extract subject from generated content
   * @param content The generated content
   * @returns Extracted subject
   */
  private extractSubject(content: string): string {
    // Try to find a subject line in the content
    const subjectMatch = content.match(/Subject:(.+?)(\n|$)/i);
    if (subjectMatch && subjectMatch[1]) {
      return subjectMatch[1].trim();
    }
    
    // If no subject line, use the first line as subject
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('From:') && !trimmed.startsWith('To:')) {
        return trimmed.replace(/^(Re:|Fwd:)\s*/, '');
      }
    }
    
    return 'No Subject';
  }

  /**
   * Extract content from generated response
   * @param content The generated content
   * @returns Extracted email body
   */
  private extractContent(content: string): string {
    // Remove email headers if present
    let emailBody = content;
    const headerEndIndex = content.indexOf('\n\n');
    
    if (headerEndIndex !== -1) {
      const headerSection = content.substring(0, headerEndIndex);
      if (headerSection.includes('Subject:') || headerSection.includes('From:') || headerSection.includes('To:')) {
        emailBody = content.substring(headerEndIndex + 2);
      }
    }
    
    return emailBody.trim();
  }

  /**
   * Parse suggestions from AI response
   * @param content The AI response content
   * @returns Array of suggestions
   */
  private parseSuggestions(content: string): Suggestion[] {
    try {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            id: crypto.randomUUID(),
            type: item.type || 'content',
            content: item.content || item.suggestion || '',
            position: item.position || { start: 0, end: 0 },
            confidence: item.confidence || 0.8,
            explanation: item.explanation || '',
            alternatives: item.alternatives || []
          }));
        }
      } catch (e) {
        // Not JSON, continue with text parsing
      }
      
      // Parse as text with numbered suggestions
      const suggestions: Suggestion[] = [];
      const lines = content.split('\n');
      let currentSuggestion: Partial<Suggestion> | null = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check for numbered suggestion
        const suggestionMatch = trimmed.match(/^(\d+)[.):]\s*(.+)$/);
        if (suggestionMatch) {
          if (currentSuggestion) {
            suggestions.push({
              id: crypto.randomUUID(),
              type: 'content',
              content: currentSuggestion.content || '',
              position: { start: 0, end: 0 },
              confidence: 0.8,
              explanation: currentSuggestion.explanation || '',
              alternatives: []
            });
          }
          
          currentSuggestion = {
            content: suggestionMatch[2]
          };
        } else if (currentSuggestion && trimmed) {
          // Add to explanation of current suggestion
          currentSuggestion.explanation = (currentSuggestion.explanation || '') + ' ' + trimmed;
        }
      }
      
      // Add the last suggestion if there is one
      if (currentSuggestion) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'content',
          content: currentSuggestion.content || '',
          position: { start: 0, end: 0 },
          confidence: 0.8,
          explanation: currentSuggestion.explanation || '',
          alternatives: []
        });
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      return [];
    }
  }

  /**
   * Parse improvements from AI response
   * @param content The AI response content
   * @returns Array of improvements
   */
  private parseImprovements(content: string): ImprovedDraft['improvements'] {
    try {
      // For now, return a simple improvement
      return [
        {
          original: 'Original content',
          improved: content,
          type: 'clarity',
          explanation: 'Improved for clarity and professionalism',
          confidence: 0.9
        }
      ];
    } catch (error) {
      console.error('Error parsing improvements:', error);
      return [];
    }
  }

  /**
   * Calculate metrics for content
   * @param content The content to analyze
   * @returns Content metrics
   */
  private calculateMetrics(content: string): ImprovedDraft['metrics'] {
    // Count words
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Count sentences
    const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Calculate average sentence length
    const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Calculate readability using Flesch Reading Ease
    const readability = this.calculateReadability(content, wordCount, sentenceCount);
    
    // Calculate formality level using heuristics
    const formality = this.calculateFormality(content, words);
    
    // Calculate sentiment using basic word analysis
    const sentiment = this.calculateSentiment(content, words);
    
    return {
      readability,
      formality,
      sentiment,
      wordCount,
      sentenceCount,
      averageSentenceLength
    };
  }

  /**
   * Calculate readability using Flesch Reading Ease formula
   * @param content The content to analyze
   * @param wordCount Total word count
   * @param sentenceCount Total sentence count
   * @returns Readability score (0-100, higher is more readable)
   */
  private calculateReadability(content: string, wordCount: number, sentenceCount: number): number {
    if (wordCount === 0 || sentenceCount === 0) {
      return 50; // Default neutral score
    }
    
    // Count syllables (approximation using vowel counting)
    const syllableCount = this.countSyllables(content);
    
    // Flesch Reading Ease formula
    // Score = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    const averageWordsPerSentence = wordCount / sentenceCount;
    const averageSyllablesPerWord = syllableCount / wordCount;
    
    let score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
    
    // Clamp to 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
  }

  /**
   * Calculate formality level using linguistic heuristics
   * @param content The content to analyze
   * @param words Array of words
   * @returns Formality score (0-100, higher is more formal)
   */
  private calculateFormality(content: string, words: string[]): number {
    if (words.length === 0) {
      return 50; // Default neutral score
    }
    
    let formalityScore = 50; // Start with neutral
    
    // Formal indicators
    const formalWords = [
      'furthermore', 'however', 'therefore', 'nevertheless', 'accordingly',
      'consequently', 'moreover', 'indeed', 'thus', 'hence', 'whereas',
      'pursuant', 'regarding', 'concerning', 'respectively', 'sincerely',
      'respectfully', 'cordially', 'esteemed', 'distinguished'
    ];
    
    // Informal indicators
    const informalWords = [
      'gonna', 'wanna', 'yeah', 'ok', 'okay', 'hey', 'hi', 'thanks',
      'thx', 'btw', 'lol', 'omg', 'awesome', 'cool', 'great',
      'stuff', 'thing', 'things', 'kinda', 'sorta'
    ];
    
    // Contractions indicate informality
    const contractions = [
      "don't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't",
      "haven't", "hasn't", "hadn't", "wouldn't", "couldn't", "shouldn't",
      "I'm", "you're", "he's", "she's", "it's", "we're", "they're",
      "I've", "you've", "we've", "they've", "I'll", "you'll", "he'll",
      "she'll", "it'll", "we'll", "they'll", "I'd", "you'd", "he'd",
      "she'd", "it'd", "we'd", "they'd"
    ];
    
    const contentLower = content.toLowerCase();
    
    // Check for formal words
    const formalWordCount = formalWords.filter(word => 
      contentLower.includes(word.toLowerCase())
    ).length;
    
    // Check for informal words
    const informalWordCount = informalWords.filter(word => 
      contentLower.includes(word.toLowerCase())
    ).length;
    
    // Check for contractions
    const contractionCount = contractions.filter(contraction => 
      contentLower.includes(contraction.toLowerCase())
    ).length;
    
    // Calculate formality adjustments
    formalityScore += (formalWordCount * 5); // +5 per formal word
    formalityScore -= (informalWordCount * 8); // -8 per informal word
    formalityScore -= (contractionCount * 3); // -3 per contraction
    
    // Additional heuristics
    // Longer sentences tend to be more formal
    const avgSentenceLength = words.length / (content.split(/[.!?]+/).length || 1);
    if (avgSentenceLength > 20) {
      formalityScore += 10;
    } else if (avgSentenceLength < 10) {
      formalityScore -= 5;
    }
    
    // Passive voice indicators (basic check)
    const passiveIndicators = ['is', 'are', 'was', 'were', 'been', 'being'];
    const passiveCount = passiveIndicators.filter(word => 
      contentLower.includes(` ${word} `)
    ).length;
    formalityScore += (passiveCount * 2);
    
    // Clamp to 0-100 range
    formalityScore = Math.max(0, Math.min(100, formalityScore));
    
    return Math.round(formalityScore);
  }

  /**
   * Calculate sentiment using basic word-based analysis
   * @param content The content to analyze
   * @param words Array of words
   * @returns Sentiment score (0-100, where 0=negative, 50=neutral, 100=positive)
   */
  private calculateSentiment(content: string, words: string[]): number {
    if (words.length === 0) {
      return 50; // Default neutral score
    }
    
    // Positive words
    const positiveWords = [
      'excellent', 'great', 'good', 'wonderful', 'amazing', 'fantastic',
      'outstanding', 'perfect', 'pleased', 'happy', 'delighted', 'excited',
      'appreciate', 'thank', 'thanks', 'grateful', 'love', 'like',
      'success', 'successful', 'achievement', 'accomplished', 'effective',
      'efficient', 'helpful', 'useful', 'valuable', 'beneficial',
      'positive', 'optimistic', 'confident', 'impressed', 'satisfied'
    ];
    
    // Negative words
    const negativeWords = [
      'terrible', 'awful', 'bad', 'horrible', 'disappointing', 'frustrated',
      'angry', 'upset', 'concerned', 'worried', 'problem', 'issue',
      'error', 'mistake', 'wrong', 'incorrect', 'failed', 'failure',
      'impossible', 'difficult', 'challenging', 'unfortunately', 'sadly',
      'regret', 'sorry', 'apologize', 'trouble', 'confusion', 'confused',
      'urgent', 'critical', 'serious', 'severe', 'negative', 'poor'
    ];
    
    const contentLower = content.toLowerCase();
    
    // Count positive and negative words
    const positiveCount = positiveWords.filter(word => 
      contentLower.includes(word.toLowerCase())
    ).length;
    
    const negativeCount = negativeWords.filter(word => 
      contentLower.includes(word.toLowerCase())
    ).length;
    
    // Calculate sentiment score
    let sentimentScore = 50; // Start neutral
    
    // Adjust based on word counts
    sentimentScore += (positiveCount * 8); // +8 per positive word
    sentimentScore -= (negativeCount * 8); // -8 per negative word
    
    // Additional heuristics
    // Exclamation marks can indicate enthusiasm or urgency
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 0) {
      // Could be positive excitement or negative urgency
      // Context matters, but we'll assume mild positive
      sentimentScore += Math.min(exclamationCount * 2, 10);
    }
    
    // Question marks might indicate uncertainty (slightly negative)
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 0) {
      sentimentScore -= Math.min(questionCount * 1, 5);
    }
    
    // All caps words might indicate shouting (negative)
    const capsWords = words.filter(word => 
      word.length > 3 && word === word.toUpperCase()
    ).length;
    sentimentScore -= (capsWords * 3);
    
    // Clamp to 0-100 range
    sentimentScore = Math.max(0, Math.min(100, sentimentScore));
    
    return Math.round(sentimentScore);
  }

  /**
   * Count syllables in text (approximation using vowel counting)
   * @param text The text to analyze
   * @returns Estimated syllable count
   */
  private countSyllables(text: string): number {
    if (!text) return 0;
    
    // Remove punctuation and convert to lowercase
    const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, '');
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    let totalSyllables = 0;
    
    for (const word of words) {
      // Basic syllable counting using vowel groups
      // This is an approximation and won't be perfect
      let syllables = 0;
      let previousWasVowel = false;
      
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const isVowel = 'aeiouy'.includes(char);
        
        if (isVowel && !previousWasVowel) {
          syllables++;
        }
        
        previousWasVowel = isVowel;
      }
      
      // Handle silent 'e' at the end
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      // Every word has at least one syllable
      if (syllables === 0) {
        syllables = 1;
      }
      
      totalSyllables += syllables;
    }
    
    return totalSyllables;
  }

  /**
   * Get default user preferences
   * @returns Default user preferences
   */
  private getDefaultUserPreferences(): UserPreferences {
    return defaultPreferences;
  }
}

// Export singleton instance
export const aiEmailService = AIEmailService.getInstance();
export default aiEmailService;
