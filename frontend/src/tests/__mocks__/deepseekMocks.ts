/**
 * Mock implementations for DeepseekService to use in tests
 */

import { AIResponse, AIAnalysis } from '../../types/deepseek';
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
  // Return type is Promise<string>
  generateResponse: jest.fn().mockResolvedValue('This is a mock response from the Deepseek AI service.'),
  
  generateEmailDraft: jest.fn().mockResolvedValue({
    content: 'Mock email draft content',
    metadata: { tone: 'neutral', length: 25, confidence: 0.9 }
  } satisfies AIResponse),

  analyzeEmailTone: jest.fn().mockResolvedValue({
    tone: 'neutral',
    sentiment: 'neutral',
    formality: 50,
    clarity: 80
  } satisfies AIAnalysis),

  suggestResponses: jest.fn().mockResolvedValue(['Mock suggestion 1', 'Mock suggestion 2']),
  improveWriting: jest.fn().mockResolvedValue('Improved mock text.'),
  configure: jest.fn(),
  clearHistory: jest.fn(),
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
