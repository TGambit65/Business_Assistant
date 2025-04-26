/**
 * Enhanced DeepseekService
 * 
 * Provides AI functionality with:
 * - Improved context management
 * - Comprehensive error handling
 * - Performance optimizations
 * - Rate limiting and quota management
 */

import { 
  AIContext, 
  AIGenerationRequest, 
  AIGenerationResponse,
  AIRequestContext,
  Message,
  AIResponse,
  AIAnalysis,
  RetryConfig,
  CacheOptions,
  DeepseekService as IDeepseekService
} from '../types';
import { Email } from '../types/email';
import { UserPreferences } from '../types/user';
import { authService } from './index';
import aiContext from '../lib/aiContext';

/**
 * Enhanced Deepseek AI Service
 */
class DeepseekService implements IDeepseekService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.deepseek.com/v1';
  private fallbackUrl = 'https://api.deepseek.ai/v1';
  private models: string[] = [
    'deepseek-chat',
    'deepseek-llm',
    'deepseek-coder',
    'deepseek/deepseek-coder-33b-instruct'
  ];
  private currentModelIndex = 0;
  private history: Message[] = [];
  private cache: Map<string, { response: any, timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 15000
  };
  private cacheOptions: CacheOptions = {
    enabled: true,
    ttl: 3600 // 1 hour cache by default
  };
  private rateLimitResetTime = 0;
  private remainingRequests = 10; // Default conservative value

  constructor() {
    // Try different possible environment variable names to find the API key
    const envApiKey = typeof process !== 'undefined' && process.env ? (
      process.env.REACT_APP_DEEPSEEK_V3_KEY || 
      process.env.REACT_APP_DEEPSEEK_API_KEY ||
      process.env.REACT_APP_DEEPSEEK_KEY
    ) : undefined;
    
    this.apiKey = envApiKey || null;
    
    // Log API key availability for debugging
    if (this.apiKey) {
      console.log('Deepseek API key is available');
    } else {
      console.warn('Deepseek API key not found - functionality will be limited');
    }
  }

  /**
   * Set configuration for the service
   */
  public configure(config: { 
    apiKey?: string;
    baseUrl?: string;
    cacheOptions?: Partial<CacheOptions>;
    retryConfig?: Partial<RetryConfig>;
  }): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.cacheOptions) {
      this.cacheOptions = {
        ...this.cacheOptions,
        ...config.cacheOptions
      };
    }
    if (config.retryConfig) {
      this.retryConfig = {
        ...this.retryConfig,
        ...config.retryConfig
      };
    }
  }

  /**
   * Clear the chat history
   */
  public clearHistory(): void {
    this.history = [];
    console.log('Chat history cleared');
  }

  /**
   * Clear the response cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Generate an email draft using AI
   * @param context The context for the email generation
   * @returns Promise with the generated email draft
   */
  public async generateEmailDraft(context: AIRequestContext): Promise<AIResponse> {
    // Create cache key from the request context
    const cacheKey = this.createCacheKey('emailDraft', context);
    
    // Check cache first if enabled
    if (this.cacheOptions.enabled) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached email draft');
        return cachedResponse;
      }
    }

    // Check for pending duplicate request
    if (this.pendingRequests.has(cacheKey)) {
      console.log('Using existing pending request for email draft');
      return this.pendingRequests.get(cacheKey) as Promise<AIResponse>;
    }

    // Create request promise
    const requestPromise = this.executeWithRetry(async () => {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Build user prompt
      const userPrompt = this.buildEmailDraftPrompt(context);
      
      // Prepare messages
      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...context.userHistory,
        { role: 'user', content: userPrompt }
      ];

      // Make API request
      const response = await this.makeAPIRequest(messages, {
        temperature: 0.7,
        max_tokens: 1500
      });

      // Process response
      const content = this.extractContentFromResponse(response);
      let emailContent: string;
      let subject = '';
      
      // Try to parse the response as JSON
      try {
        const parsed = JSON.parse(content);
        subject = parsed.subject || '';
        emailContent = parsed.body || content;
      } catch (e) {
        // If parsing fails, use the raw content
        emailContent = content;
      }
      
      // Create structured response
      const aiResponse: AIResponse = {
        content: emailContent,
        metadata: {
          tone: this.detectTone(emailContent),
          length: this.countWords(emailContent),
          suggestions: this.generateSuggestions(emailContent),
          confidence: 0.85 // Default confidence score
        }
      };
      
      // Cache the response
      if (this.cacheOptions.enabled) {
        this.cacheResponse(cacheKey, aiResponse);
      }
      
      return aiResponse;
    });
    
    // Store promise to avoid duplicate requests
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      setTimeout(() => {
        this.pendingRequests.delete(cacheKey);
      }, 1000);
    }
  }

  /**
   * Analyze the tone and sentiment of an email
   * @param email The email to analyze
   * @returns Promise with analysis results
   */
  public async analyzeEmailTone(email: Email): Promise<AIAnalysis> {
    // Create cache key
    const cacheKey = this.createCacheKey('emailAnalysis', { emailId: email.id });
    
    // Check cache first if enabled
    if (this.cacheOptions.enabled) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse as unknown as AIAnalysis;
      }
    }

    return this.executeWithRetry(async () => {
      // Build prompt for tone analysis
      const prompt = `
        Analyze the following email and provide:
        1. The overall tone
        2. Sentiment (positive, neutral, or negative)
        3. Formality level (0-100)
        4. Clarity level (0-100)
        5. Any action items mentioned
        6. Suggestions for improvement
        
        Format the response as JSON.
        
        EMAIL:
        From: ${email.from.name} <${email.from.email}>
        Subject: ${email.subject}
        
        ${email.body}
      `;
      
      // Prepare messages
      const messages: Message[] = [
        { 
          role: 'system', 
          content: 'You are an AI assistant specialized in email analysis. Provide accurate and objective analysis.' 
        },
        { role: 'user', content: prompt }
      ];

      // Make API request
      const response = await this.makeAPIRequest(messages, {
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 500
      });

      // Process response
      const content = this.extractContentFromResponse(response);
      
      // Parse the JSON response
      try {
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
        
        // Create structured analysis
        const analysis: AIAnalysis = {
          tone: parsed.tone || 'neutral',
          sentiment: parsed.sentiment || 'neutral',
          formality: parsed.formality || 50,
          clarity: parsed.clarity || 50,
          actionItems: parsed.actionItems || [],
          suggestions: parsed.suggestions || []
        };
        
        // Cache the response
        if (this.cacheOptions.enabled) {
          this.cacheResponse(cacheKey, analysis);
        }
        
        return analysis;
      } catch (e) {
        console.error('Error parsing analysis response:', e);
        
        // Return fallback analysis
        return {
          tone: 'neutral',
          sentiment: 'neutral',
          formality: 50,
          clarity: 50,
          actionItems: [],
          suggestions: []
        };
      }
    });
  }

  /**
   * Suggest possible responses to an email
   * @param email The email to generate suggestions for
   * @returns Promise with an array of suggested responses
   */
  public async suggestResponses(email: Email): Promise<string[]> {
    // Create cache key
    const cacheKey = this.createCacheKey('suggestResponses', { emailId: email.id });
    
    // Check cache first if enabled
    if (this.cacheOptions.enabled) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse as unknown as string[];
      }
    }

    return this.executeWithRetry(async () => {
      // Build prompt for response suggestions
      const prompt = `
        Generate 3 different possible responses to the following email.
        Each response should be brief (2-3 sentences) and have a different tone:
        1. Professional/Formal
        2. Friendly/Casual
        3. Brief/Direct
        
        Format the response as a JSON array of strings.
        
        EMAIL:
        From: ${email.from.name} <${email.from.email}>
        Subject: ${email.subject}
        
        ${email.body}
      `;
      
      // Prepare messages
      const messages: Message[] = [
        { 
          role: 'system', 
          content: 'You are an AI assistant specialized in email communication.' 
        },
        { role: 'user', content: prompt }
      ];

      // Make API request
      const response = await this.makeAPIRequest(messages, {
        temperature: 0.7,
        max_tokens: 500
      });

      // Process response
      const content = this.extractContentFromResponse(response);
      
      // Parse the JSON response
      try {
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
        const suggestions = Array.isArray(parsed) ? parsed : [];
        
        // Cache the response
        if (this.cacheOptions.enabled) {
          this.cacheResponse(cacheKey, suggestions);
        }
        
        return suggestions;
      } catch (e) {
        console.error('Error parsing suggestions response:', e);
        
        // Extract suggestions using regex as fallback
        const suggestions = content
          .split(/\d+\.\s+/)
          .slice(1)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        // Cache the response
        if (this.cacheOptions.enabled && suggestions.length > 0) {
          this.cacheResponse(cacheKey, suggestions);
        }
        
        return suggestions.length > 0 
          ? suggestions 
          : ['Thank you for your email.', 'I\'ll look into this.', 'I appreciate your message.'];
      }
    });
  }

  /**
   * Improve writing style and clarity
   * @param text The text to improve
   * @returns Promise with improved text
   */
  public async improveWriting(text: string): Promise<string> {
    // Create cache key
    const cacheKey = this.createCacheKey('improveWriting', { text });
    
    // Check cache first if enabled
    if (this.cacheOptions.enabled) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse as unknown as string;
      }
    }

    return this.executeWithRetry(async () => {
      // Build prompt for text improvement
      const prompt = `
        Improve the following text for clarity, professionalism, and impact.
        Fix any grammatical errors, improve word choice, and enhance the overall structure.
        Preserve the original meaning and intent.
        
        TEXT:
        ${text}
      `;
      
      // Prepare messages
      const messages: Message[] = [
        { 
          role: 'system', 
          content: 'You are an AI assistant specialized in professional writing and editing.' 
        },
        { role: 'user', content: prompt }
      ];

      // Make API request
      const response = await this.makeAPIRequest(messages, {
        temperature: 0.4,
        max_tokens: text.split(' ').length * 1.5
      });

      // Process response
      const improvedText = this.extractContentFromResponse(response);
      
      // Cache the response
      if (this.cacheOptions.enabled) {
        this.cacheResponse(cacheKey, improvedText);
      }
      
      return improvedText;
    });
  }

  /**
   * Generate a response to an email
   * @param email The email to generate a response for
   * @returns Promise with the generated response text
   */
  public async generateResponse(email: Email): Promise<string> {
    // Create cache key
    const cacheKey = this.createCacheKey('generateResponse', { emailId: email.id });
    
    // Check cache first if enabled
    if (this.cacheOptions.enabled) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse as string;
      }
    }

    return this.executeWithRetry(async () => {
      // Build prompt for email response
      const prompt = `
        Generate a thoughtful, professional response to the following email.
        The response should directly address the content and questions in the email.
        Keep the tone professional but warm, and be concise but thorough.
        
        EMAIL:
        From: ${email.from.name} <${email.from.email}>
        Subject: ${email.subject}
        
        ${email.body}
      `;
      
      // Prepare messages
      const messages: Message[] = [
        { 
          role: 'system', 
          content: 'You are an AI assistant specialized in business email communication.' 
        },
        { role: 'user', content: prompt }
      ];

      // Make API request
      const response = await this.makeAPIRequest(messages, {
        temperature: 0.5,
        max_tokens: 1000
      });

      // Process response
      const responseText = this.extractContentFromResponse(response);
      
      // Cache the response
      if (this.cacheOptions.enabled) {
        this.cacheResponse(cacheKey, responseText);
      }
      
      return responseText;
    });
  }

  /**
   * Make API request with the current model and handle fallbacks
   */
  private async makeAPIRequest(
    messages: Message[],
    options: { temperature?: number; max_tokens?: number }
  ): Promise<any> {
    const { temperature = 0.7, max_tokens = 500 } = options;
    
    // Check if we need to wait due to rate limiting
    if (this.rateLimitResetTime > Date.now()) {
      const waitTime = this.rateLimitResetTime - Date.now();
      console.log(`Rate limit hit, waiting ${waitTime}ms before retrying`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Check if we have remaining quota
    if (this.remainingRequests <= 0) {
      throw new Error('API rate limit reached. Please try again later.');
    }
    
    try {
      // Get the current model
      const currentModel = this.models[this.currentModelIndex];
      
      // Validate API key
      if (!this.apiKey) {
        throw new Error('Deepseek API key is not configured');
      }
      
      // Compress messages if they're too large
      const compressedMessages = this.compressMessages(messages);
      
      // Make API request
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: compressedMessages,
          temperature,
          max_tokens
        })
      });

      // Update rate limit information from headers
      this.updateRateLimitInfo(response.headers);
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `${response.status} ${response.statusText}`;
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limit exceeded
          this.rateLimitResetTime = Date.now() + 60000; // Wait 1 minute by default
          this.remainingRequests = 0;
          throw new Error(`Rate limit exceeded: ${errorMessage}`);
        } else if (response.status === 401 || response.status === 403) {
          // Authentication error
          throw new Error(`API authentication error: ${errorMessage}`);
        } else if (response.status === 404) {
          // Model not found, try next model
          console.warn(`Model ${currentModel} not found, trying next model. Error: ${errorMessage}`);
          this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
          return this.makeAPIRequest(messages, options);
        } else {
          // Try fallback URL if primary URL fails
          if (this.baseUrl !== this.fallbackUrl) {
            console.warn(`Primary API endpoint failed with: ${errorMessage}. Trying fallback URL.`);
            const originalUrl = this.baseUrl;
            this.baseUrl = this.fallbackUrl;
            
            try {
              const fallbackResponse = await this.makeAPIRequest(messages, options);
              return fallbackResponse;
            } catch (fallbackError) {
              // If fallback also fails, revert to original URL and throw original error
              this.baseUrl = originalUrl;
              throw new Error(`API request failed: ${errorMessage}`);
            }
          } else {
            throw new Error(`API request failed: ${errorMessage}`);
          }
        }
      }

      // Parse JSON response
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error('Error making API request:', error);
      throw error;
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(headers: Headers): void {
    // Extract rate limit information from headers if available
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    
    if (remaining) {
      this.remainingRequests = parseInt(remaining, 10);
    }
    
    if (reset) {
      // Convert reset time to milliseconds
      this.rateLimitResetTime = parseInt(reset, 10) * 1000;
    }
  }

  /**
   * Compress messages to reduce token usage
   */
  private compressMessages(messages: Message[]): Message[] {
    // If the total content is small, don't compress
    const totalLength = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
    if (totalLength < 4000) {
      return messages;
    }
    
    // For longer conversations, summarize older messages
    return messages.map((msg, i) => {
      // Keep system prompts and the last 3 messages unchanged
      if (msg.role === 'system' || i >= messages.length - 3) {
        return msg;
      }
      
      // Compress older messages if they're too long
      if (msg.content && msg.content.length > 500) {
        return {
          role: msg.role,
          content: msg.content.substring(0, 200) + '...' + msg.content.substring(msg.content.length - 200)
        };
      }
      
      return msg;
    });
  }

  /**
   * Execute a function with retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    let delay = this.retryConfig.initialDelay;
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        // Check if we've reached max retries
        if (retries >= this.retryConfig.maxRetries) {
          throw error;
        }
        
        // Determine if error is retryable
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRetryableError = 
          errorMessage.includes('rate limit') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('network') ||
          errorMessage.includes('server error') ||
          errorMessage.includes('503') ||
          errorMessage.includes('429');
        
        if (isRetryableError) {
          console.warn(`Retry ${retries + 1}/${this.retryConfig.maxRetries} after ${delay}ms: ${errorMessage}`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Increase retry count and delay for next attempt
          retries++;
          delay = Math.min(
            delay * this.retryConfig.backoffFactor,
            this.retryConfig.maxDelay
          );
        } else {
          // Non-retryable error, just throw
          throw error;
        }
      }
    }
  }

  /**
   * Extract content from the API response
   */
  private extractContentFromResponse(response: any): string {
    try {
      // Handle different response formats
      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      } else if (response?.choices?.[0]?.text) {
        return response.choices[0].text;
      } else if (response?.content) {
        return response.content;
      } else if (typeof response === 'string') {
        return response;
      }
      
      // Return empty string if we can't extract content
      console.warn('Could not extract content from response:', response);
      return '';
    } catch (e) {
      console.error('Error extracting content from response:', e);
      return '';
    }
  }

  /**
   * Build system prompt based on the request context
   */
  private buildSystemPrompt(context: AIRequestContext): string {
    const { systemPrompt, userPreferences } = context;
    
    // Start with the provided system prompt
    let prompt = systemPrompt;
    
    // Add general AI context
    prompt += `\n\nCompany Information:\n${JSON.stringify(aiContext.company, null, 2)}`;
    
    // Add communication guidelines
    prompt += `\n\nCommunication Guidelines:\n${JSON.stringify(aiContext.communicationGuidelines, null, 2)}`;
    
    // Add user preferences
    prompt += `\n\nUser Preferences:\n${JSON.stringify(userPreferences, null, 2)}`;
    
    // Add email context if available
    if (context.emailContext) {
      prompt += `\n\nRelevant Email Context:\nSubject: ${context.emailContext.subject}\nFrom: ${context.emailContext.from.name} <${context.emailContext.from.email}>\nDate: ${context.emailContext.timestamp.toISOString()}\n\n${context.emailContext.body}`;
    }
    
    return prompt;
  }

  /**
   * Build email draft prompt
   */
  private buildEmailDraftPrompt(context: AIRequestContext): string {
    // You would customize this based on the type of email draft needed
    return `
      Generate a professional email draft based on the provided context.
      The email should be well-structured, clear, and effective.
      
      Format the response as a JSON object with the following structure:
      {
        "subject": "The email subject line",
        "body": "The body of the email"
      }
    `;
  }

  /**
   * Create a cache key from context
   */
  private createCacheKey(operation: string, context: any): string {
    // Create a deterministic string representation of the context
    const contextStr = JSON.stringify(context, (key, value) => {
      // Skip functions and complex objects for caching
      if (typeof value === 'function') return undefined;
      if (key === 'emailContext' && value) {
        // For emails, just use id, subject and a hash of the body
        return { id: value.id, subject: value.subject, bodyHash: this.hashString(value.body) };
      }
      return value;
    });
    
    // Return a hash of the operation and context
    return `${operation}_${this.hashString(contextStr)}`;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get cached response if valid
   */
  private getCachedResponse(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if cache has expired
    const now = Date.now();
    if (now - cached.timestamp > this.cacheOptions.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.response;
  }

  /**
   * Cache a response
   */
  private cacheResponse(key: string, response: any): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Detect the tone of text
   */
  private detectTone(text: string): string {
    // This is a simplified implementation
    // In a real implementation, this would use ML or more sophisticated analysis
    
    const text_lower = text.toLowerCase();
    
    if (text_lower.includes('urgent') || text_lower.includes('immediately') || text_lower.includes('asap')) {
      return 'urgent';
    } else if (text_lower.includes('convince') || text_lower.includes('persuade') || text_lower.includes('consider')) {
      return 'persuasive';
    } else if (text_lower.includes('please') && text_lower.includes('thank you')) {
      return 'professional';
    } else if (text_lower.includes('dear') && (text_lower.includes('sincerely') || text_lower.includes('regards'))) {
      return 'formal';
    } else if (text_lower.includes('hey') || text_lower.includes('cheers') || text_lower.includes('thanks')) {
      return 'friendly';
    } else if (text_lower.includes('hi') || text_lower.includes('hello') || text_lower.includes('talk soon')) {
      return 'casual';
    }
    
    return 'professional'; // Default tone
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Generate suggestions based on content
   */
  private generateSuggestions(content: string): string[] {
    // This is a placeholder for a more sophisticated implementation
    // In a real application, this would be much more complex
    
    const suggestions: string[] = [];
    
    // Check for common improvements
    if (content.length > 500) {
      suggestions.push('Consider shortening for better readability');
    }
    
    if (content.includes('Thanks') && !content.includes('Thank you')) {
      suggestions.push('Consider using "Thank you" for more formality');
    }
    
    if (!content.includes('Please')) {
      suggestions.push('Consider adding "please" for politeness');
    }
    
    return suggestions;
  }
}

// Export a singleton instance
export default new DeepseekService(); 