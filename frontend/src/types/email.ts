/**
 * TypeScript definitions for Email-related types
 */

/**
 * Represents an email address with optional display name
 */
export interface EmailAddress {
  email: string;
  name?: string;
}

/**
 * Represents an email attachment
 */
export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

/**
 * Represents a complete email
 */
export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  timestamp: Date;
  attachments?: Attachment[];
  labels?: string[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

/**
 * Represents a draft email that may be incomplete
 */
export interface EmailDraft {
  id?: string;
  from?: EmailAddress;
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  attachments?: Attachment[];
  lastModified?: Date;
}

/**
 * Represents an email template
 */
export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Represents an email rule for automation
 */
export interface EmailRule {
  id: string;
  name: string;
  conditions: EmailRuleCondition[];
  actions: EmailRuleAction[];
  isActive: boolean;
  priority: number; // Higher number = higher priority
}

/**
 * Condition for an email rule
 */
export interface EmailRuleCondition {
  field: 'from' | 'to' | 'cc' | 'subject' | 'body' | 'hasAttachment';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches' | 'exists';
  value: string;
}

/**
 * Action for an email rule
 */
export interface EmailRuleAction {
  type: 'move' | 'label' | 'markRead' | 'star' | 'archive' | 'delete' | 'forward';
  value?: string; // Label name, folder name, forward email, etc.
} 