/**
 * TypeScript definitions for AI Draft Generator
 */

import { ContentTone } from './ai';
import { UserPreferences } from './user';

/**
 * Context for generating email drafts
 */
export interface DraftContext {
  recipient: {
    email: string;
    name?: string;
    role?: string;
    company?: string;
  };
  purpose: string;
  tone: ContentTone;
  keyPoints: string[];
  previousCommunication?: {
    date: Date;
    content: string;
    type: 'email' | 'meeting' | 'call' | 'other';
  }[];
  userPreferences?: UserPreferences;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  deadline?: Date;
  priority?: 'low' | 'medium' | 'high';
  followUp?: boolean;
  cc?: string[];
  bcc?: string[];
}

/**
 * Generated email draft
 */
export interface Draft {
  id: string;
  subject: string;
  content: string;
  context: DraftContext;
  metadata: {
    generatedAt: Date;
    model: string;
    confidence: number;
    tokensUsed: number;
    processingTime: number;
    suggestions: Suggestion[];
  };
  status: 'draft' | 'reviewing' | 'approved' | 'sent';
  version: number;
  history: {
    timestamp: Date;
    action: 'created' | 'edited' | 'reviewed' | 'approved' | 'sent';
    userId: string;
    changes?: {
      field: string;
      oldValue: string;
      newValue: string;
    }[];
  }[];
}

/**
 * AI-generated suggestion for improving the draft
 */
export interface Suggestion {
  id: string;
  type: 'content' | 'tone' | 'grammar' | 'style' | 'formatting';
  content: string;
  position: {
    start: number;
    end: number;
  };
  confidence: number;
  explanation: string;
  alternatives?: string[];
  metadata?: {
    category: string;
    impact: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high';
  };
}

/**
 * Improved version of a draft with AI enhancements
 */
export interface ImprovedDraft extends Draft {
  improvements: {
    original: string;
    improved: string;
    type: 'grammar' | 'style' | 'tone' | 'clarity' | 'conciseness';
    explanation: string;
    confidence: number;
  }[];
  metrics: {
    readability: number;
    formality: number;
    sentiment: number;
    wordCount: number;
    sentenceCount: number;
    averageSentenceLength: number;
  };
  suggestions: Suggestion[];
}

/**
 * Configuration for the AI Draft Generator
 */
export interface AIDraftGeneratorConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
  maxSuggestions: number;
  suggestionConfidenceThreshold: number;
  rateLimit: {
    requestsPerMinute: number;
    maxTokensPerDay: number;
  };
  security: {
    contentFiltering: boolean;
    sensitiveDataDetection: boolean;
    auditLogging: boolean;
  };
} 