/**
 * Mock implementations for DeepseekService to use in tests
 */

import { AIResponse, AIAnalysis } from '../../types/deepseek';
import { Email } from '../../types/email';

export const mockDeepseekResponse = {
  id: 'mock-response-id',
  object: 'completion',
  created: Date.now(),
  model: 'deepseek-chat',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a mock response from the Deepseek AI service.'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 20,
    completion_tokens: 15,
    total_tokens: 35
  }
};

export const deepseekServiceMock = {
  // Generate response with full email context
  generateResponse: jest.fn().mockImplementation((email: Email): Promise<string> => {
    return Promise.resolve('This is a mock response from the Deepseek AI service.');
  }),
  
  // Generate email draft with complete metadata
  generateEmailDraft: jest.fn().mockImplementation((): Promise<AIResponse> => {
    return Promise.resolve({
      content: 'Mock email draft content',
      metadata: { 
        tone: 'neutral', 
        length: 25, 
        suggestions: ['Add more details', 'Include a formal closing'],
        confidence: 0.9 
      }
    });
  }),

  // Analyze email tone with all required fields
  analyzeEmailTone: jest.fn().mockImplementation((): Promise<AIAnalysis> => {
    return Promise.resolve({
      tone: 'neutral',
      sentiment: 'neutral',
      formality: 50,
      clarity: 80,
      actionItems: ['Review document', 'Follow up by Friday'],
      suggestions: ['Add more specific details', 'Include a deadline']
    });
  }),

  // Suggest responses array
  suggestResponses: jest.fn().mockImplementation((): Promise<string[]> => {
    return Promise.resolve([
      'Mock suggestion 1', 
      'Mock suggestion 2',
      'Mock suggestion 3'
    ]);
  }),
  
  // Improve writing with text processing
  improveWriting: jest.fn().mockImplementation((): Promise<string> => {
    return Promise.resolve('Improved mock text with better grammar and tone.');
  }),
  
  // Configuration method
  configure: jest.fn(),
  
  // Clear history state
  clearHistory: jest.fn(),
  
  // Clear response cache
  clearCache: jest.fn()
};

export const mockAxiosPost = jest.fn().mockImplementation(() => 
  Promise.resolve({
    data: mockDeepseekResponse,
    status: 200,
    statusText: 'OK',
    headers: {}
  })
);

export const mockAxios = {
  post: mockAxiosPost,
  isAxiosError: jest.fn().mockReturnValue(true)
};
