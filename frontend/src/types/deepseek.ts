/**
 * TypeScript definitions for DeepseekService types
 */

import { ContentTone } from './ai';
import { Email } from './email';
import { UserPreferences } from './user';

/**
 * Request context interface for AI requests
 */
export interface AIRequestContext {
  systemPrompt: string;
  userHistory: Message[];
  emailContext?: Email;
  userPreferences: UserPreferences;
}

/**
 * Message interface for chat history
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Response interface for AI responses
 */
export interface AIResponse {
  content: string;
  metadata: {
    tone: string;
    length: number;
    suggestions?: string[];
    confidence: number;
  };
}

/**
 * Email analysis interface
 */
export interface AIAnalysis {
  tone: ContentTone | 'neutral' | 'formal' | 'casual' | 'urgent' | 'polite';
  sentiment: 'positive' | 'neutral' | 'negative';
  formality: number;  // 0-100
  clarity: number;    // 0-100
  actionItems?: string[];
  suggestions?: string[];
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  maxDelay: number;
}

/**
 * Cache control options
 */
export interface CacheOptions {
  enabled: boolean;
  ttl: number; // Time to live in seconds
}

/**
 * DeepseekService interface
 */
export interface DeepseekService {
  generateEmailDraft(context: AIRequestContext): Promise<AIResponse>;
  analyzeEmailTone(email: Email): Promise<AIAnalysis>;
  suggestResponses(email: Email): Promise<string[]>;
  improveWriting(text: string): Promise<string>;
  generateResponse(email: Email): Promise<string>;
  configure(config: {
    apiKey?: string;
    baseUrl?: string;
    cacheOptions?: Partial<CacheOptions>;
    retryConfig?: Partial<RetryConfig>;
  }): void;
  clearHistory(): void;
  clearCache(): void;
} 