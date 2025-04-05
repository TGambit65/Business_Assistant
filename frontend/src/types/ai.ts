/**
 * TypeScript definitions for AI-related types
 */

/**
 * Available tones for AI-generated content
 */
export type ContentTone = 'formal' | 'professional' | 'friendly' | 'casual' | 'persuasive' | 'urgent';

/**
 * Available content lengths for AI-generated content
 */
export type ContentLength = 'short' | 'medium' | 'long' | 'concise' | 'detailed';

/**
 * Available recipient types for contextual awareness
 */
export type RecipientType = 'client' | 'colleague' | 'vendor' | 'partner' | 'manager' | 'prospect' | 'customer';

/**
 * Communication guidelines for company context
 */
export interface CommunicationGuidelines {
  preferredTerms?: Record<string, string>; // Map of terms to avoid -> preferred terms
  avoidTerms?: string[];
  inclusiveLanguage?: boolean;
  formality?: 'very formal' | 'formal' | 'professional' | 'casual' | 'informal';
  emailSignature?: string;
  includeDisclaimer?: boolean;
  disclaimer?: string;
}

/**
 * Company context for AI to understand organizational background
 */
export interface CompanyContext {
  name: string;
  industry: string;
  communicationGuidelines: CommunicationGuidelines;
  brandVoice: string;
  products?: string[];
  services?: string[];
  missionStatement?: string;
  coreValues?: string[];
}

/**
 * AI context for generating content
 */
export interface AIContext {
  purpose: string;
  tone: ContentTone;
  length: ContentLength;
  recipientType: RecipientType;
  language: string;
  companyContext?: CompanyContext;
  keyPoints?: string[];
  previousCommunication?: string;
  urgency?: 'low' | 'medium' | 'high';
  creativity?: number; // 0-100 scale
}

/**
 * AI generation request parameters
 */
export interface AIGenerationRequest {
  context: AIContext;
  prompt: string;
  maxTokens?: number;
  temperature?: number; // 0-1.0
  includeSourceCitations?: boolean;
  formatAsHtml?: boolean;
  preserveFormatting?: boolean;
}

/**
 * AI generation response
 */
export interface AIGenerationResponse {
  content: string;
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
    model?: string;
    sourcesUsed?: string[];
  };
  alternatives?: string[];
  cached?: boolean;
}

/**
 * AI document used for context
 */
export interface ContextDocument {
  id: string;
  title: string;
  content: string;
  type: 'email' | 'contract' | 'report' | 'note' | 'other';
  tags?: string[];
  createdAt: Date;
  relevanceScore?: number; // 0-100
} 