export interface Variable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'name' | 'custom';
  defaultValue?: string;
  required: boolean;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean;
  };
}

export interface Permission {
  id: string;
  type: 'read' | 'write' | 'admin' | 'share';
  userId: string;
  groupId?: string;
  grantedAt: Date;
  grantedBy: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  variables: Variable[];
  aiSuggestions: boolean;
  category: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  isPublic: boolean;
  tags: string[];
  metadata: {
    description?: string;
    language?: string;
    industry?: string;
    useCase?: string;
  };
}

export interface TemplateContext {
  variables: Record<string, any>;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  organization?: {
    id: string;
    name: string;
    domain: string;
  };
  timestamp: Date;
}

export interface AISuggestion {
  id: string;
  type: 'content' | 'variable' | 'style' | 'optimization';
  description: string;
  confidence: number;
  suggestedChanges: {
    content?: string;
    variables?: Variable[];
    metadata?: Record<string, any>;
  };
  reasoning: string;
  createdAt: Date;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
  warnings: {
    field: string;
    message: string;
    code: string;
  }[];
} 