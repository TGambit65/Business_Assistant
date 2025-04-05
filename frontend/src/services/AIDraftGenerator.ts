import { 
  DraftContext, 
  Draft, 
  Suggestion, 
  ImprovedDraft, 
  AIDraftGeneratorConfig 
} from '../types/draft';
import { SecurityManager } from '../security/SecurityManager';
import { analyticsService } from './AnalyticsService';
import deepseekService from './DeepseekService';
import { AIRequestContext, Message } from '../types/deepseek';
import { UserPreferences } from '../types/user';

export class AIDraftGenerator {
  private static instance: AIDraftGenerator;
  private securityManager: SecurityManager;
  private aiService: typeof deepseekService;
  private config: AIDraftGeneratorConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = Date.now();
  private dailyTokenCount: number = 0;
  private lastTokenReset: number = Date.now();

  private constructor() {
    this.securityManager = SecurityManager.getInstance();
    this.aiService = deepseekService;
    this.config = {
      model: 'deepseek-chat',
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      maxSuggestions: 5,
      suggestionConfidenceThreshold: 0.7,
      rateLimit: {
        requestsPerMinute: 60,
        maxTokensPerDay: 100000
      },
      security: {
        contentFiltering: true,
        sensitiveDataDetection: true,
        auditLogging: true
      }
    };
  }

  public static getInstance(): AIDraftGenerator {
    if (!AIDraftGenerator.instance) {
      AIDraftGenerator.instance = new AIDraftGenerator();
    }
    return AIDraftGenerator.instance;
  }

  public configure(config: Partial<AIDraftGeneratorConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

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
        userId: context.userPreferences?.defaultEmailSignature || 'system'
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

  public async provideSuggestions(currentContent: string): Promise<Suggestion[]> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize content
    const sanitizedContent = this.securityManager.sanitizeInput(currentContent);

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
    
    // Filter by confidence threshold
    const filteredSuggestions = suggestions.filter(s => s.confidence >= this.config.suggestionConfidenceThreshold);
    
    // Limit number of suggestions
    return filteredSuggestions.slice(0, this.config.maxSuggestions);
  }

  public async improveContent(draft: Draft): Promise<ImprovedDraft> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize content
    const sanitizedContent = this.securityManager.sanitizeInput(draft.content);

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
    
    // Create improved draft
    const improvedDraft: ImprovedDraft = {
      ...draft,
      content: response.content,
      improvements,
      metrics,
      suggestions: await this.provideSuggestions(response.content),
      version: draft.version + 1,
      history: [
        ...draft.history,
        {
          timestamp: new Date(),
          action: 'edited',
          userId: draft.context.userPreferences?.defaultEmailSignature || 'system',
          changes: [{
            field: 'content',
            oldValue: draft.content,
            newValue: response.content
          }]
        }
      ]
    };

    // Track analytics
    analyticsService.trackMetric('draft.improved', 1, {
      draftId: draft.id,
      improvementsCount: improvements.length.toString()
    });

    return improvedDraft;
  }

  /**
   * Get real-time suggestions for input text
   */
  public async getSuggestions(text: string): Promise<string[]> {
    // Check rate limits
    this.checkRateLimits();

    // Sanitize content
    const sanitizedText = this.securityManager.sanitizeInput(text);
    
    if (!sanitizedText || sanitizedText.trim().length < 10) {
      return [];
    }

    try {
      // Create AI request context for suggestions
      const aiContext: AIRequestContext = {
        systemPrompt: 'Provide 3-5 concise, helpful continuation suggestions for the following text input.',
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
        .slice(0, 5);
      
      // Track analytics
      analyticsService.trackMetric('suggestions.generated', suggestions.length, {
        textLength: sanitizedText.length.toString()
      });
      
      return suggestions;
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      analyticsService.trackMetric('suggestions.error', 1, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  private checkRateLimits(): void {
    const now = Date.now();

    // Check requests per minute
    if (now - this.lastRequestTime < 60000) {
      this.requestCount++;
      if (this.requestCount > this.config.rateLimit.requestsPerMinute) {
        throw new Error('Rate limit exceeded: Too many requests per minute');
      }
    } else {
      this.requestCount = 1;
      this.lastRequestTime = now;
    }

    // Check daily token limit
    if (now - this.lastTokenReset > 86400000) {
      this.dailyTokenCount = 0;
      this.lastTokenReset = now;
    }
    if (this.dailyTokenCount > this.config.rateLimit.maxTokensPerDay) {
      throw new Error('Rate limit exceeded: Daily token limit reached');
    }
  }

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
      previousCommunication: context.previousCommunication?.map(comm => ({
        ...comm,
        content: this.securityManager.sanitizeInput(comm.content)
      }))
    };
  }

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

  private buildUserHistory(context: DraftContext): Message[] {
    const history: Message[] = [];

    if (context.previousCommunication) {
      context.previousCommunication.forEach(comm => {
        history.push({
          role: 'system' as const,
          content: `Previous ${comm.type} on ${comm.date.toISOString()}: ${comm.content}`
        });
      });
    }

    return history;
  }

  private getDefaultUserPreferences(): UserPreferences {
    return {
      defaultEmailSignature: '',
      defaultReplySignature: '',
      defaultLanguage: 'en',
      defaultTone: 'professional',
      showNotifications: true,
      emailRefreshInterval: 300,
      sendReceiptConfirmation: true,
      defaultFontSize: '14px',
      defaultFontFamily: 'Arial, sans-serif',
      useRichTextEditor: true,
      useSpellCheck: true,
      alwaysShowBcc: false,
      useThreadView: true
    };
  }

  private extractSubject(content: string): string {
    const subjectMatch = content.match(/Subject: (.+)/i);
    return subjectMatch ? subjectMatch[1] : 'No Subject';
  }

  private extractContent(content: string): string {
    const contentMatch = content.match(/\n\n([\s\S]+)$/);
    return contentMatch ? contentMatch[1].trim() : content;
  }

  private parseSuggestions(content: string): Suggestion[] {
    // In a real implementation, this would parse the AI response into structured suggestions
    // For now, return a mock suggestion
    return [{
      id: crypto.randomUUID(),
      type: 'content',
      content: content,
      position: {
        start: 0,
        end: content.length
      },
      confidence: 0.8,
      explanation: 'AI-generated suggestion for improvement'
    }];
  }

  private parseImprovements(content: string): ImprovedDraft['improvements'] {
    // In a real implementation, this would parse the AI response into structured improvements
    // For now, return a mock improvement
    return [{
      original: content,
      improved: content,
      type: 'style',
      explanation: 'AI-generated improvement',
      confidence: 0.8
    }];
  }

  private calculateMetrics(content: string): ImprovedDraft['metrics'] {
    // In a real implementation, this would calculate actual metrics
    // For now, return mock metrics
    return {
      readability: 80,
      formality: 70,
      sentiment: 60,
      wordCount: content.split(/\s+/).length,
      sentenceCount: content.split(/[.!?]+/).length,
      averageSentenceLength: content.split(/\s+/).length / content.split(/[.!?]+/).length
    };
  }

  private updateMetrics(tokensUsed: number): void {
    this.dailyTokenCount += tokensUsed;
  }
}

export const aiDraftGenerator = AIDraftGenerator.getInstance(); 