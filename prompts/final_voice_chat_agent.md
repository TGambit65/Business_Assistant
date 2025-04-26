# VOICE AND CHAT AGENT IMPLEMENTATION PROMPT
Version: 2.0

## PROJECT CONTEXT
Tech Stack: TypeScript, React
Architecture: Frontend service-based
Integration Points: AI services, Assistant Interchange Format (AIF)
Security Level: High
UX Priority: Critical

## CORE REQUIREMENTS

### 1. Voice Agent Component
- Implement bidirectional voice communication using WebRTC
- Voice-to-text and text-to-voice conversion
- Encrypted context preservation
- Integration with AIContext interface
- Real-time voice processing with configurable LLM provider
- Privacy-focused implementation with user consent management

### 2. Chat Agent Component
- Build on AIComposeAssistant structure
- AIF-compliant state management
- Encrypted session preservation
- Seamless assistant switching
- Real-time synchronization
- Support for multiple LLM providers

### 3. Integration Requirements
- Use existing AIContext interface from frontend/src/types/ai.ts
- Implement AIGenerationRequest interface
- Support CommunicationGuidelines interface
- Integrate with CompanyContext
- Use existing Message interface from types/deepseek.ts

### 4. Security Requirements
- End-to-end encryption for voice data
- Secure API key management
- Rate limiting implementation
- Session-based authentication
- GDPR compliance features

## IMPLEMENTATION SPECIFICATIONS

### Voice Agent Interface
```typescript
interface VoiceAgent {
  startVoiceSession(): Promise<void>;
  stopVoiceSession(): Promise<void>;
  processVoiceInput(stream: MediaStream): Promise<string>;
  generateVoiceResponse(text: string): Promise<AudioBuffer>;
  setLLMProvider(provider: string, model: string): void;
  handleContextPreservation(context: AIContext): void;
}
```

### Chat Agent Interface
```typescript
interface ChatAgent {
  initializeChat(context: AIContext): Promise<void>;
  sendMessage(message: string): Promise<AIResponse>;
  switchAssistant(assistantType: string): Promise<void>;
  preserveContext(): AIContext;
  setLLMProvider(provider: string, model: string): void;
}
```

### State Management
```typescript
interface AgentState {
  currentContext: AIContext;
  sessionHistory: Message[];
  voicePreferences: {
    language: string;
    voice: string;
    speed: number;
  };
  providerConfig: {
    primary: LLMProvider;
    fallback?: LLMProvider;
  };
}
```

## OPTIMIZATION PARAMETERS
{
  "contextThreshold": 0.75,
  "taskType": "feature_development",
  "tokenAllocation": {
    "structure": 0.20,
    "relevantCode": 0.40,
    "dependencies": 0.20,
    "tests": 0.10,
    "flexible": 0.10
  },
  "specializationHints": ["React", "TypeScript", "AIContext", "AIF", "Security", "UX"]
}

## IMPLEMENTATION PHASES

1. Core Infrastructure
   - Set up base agent classes
   - Implement provider configuration
   - Establish security framework

2. Voice Processing
   - WebRTC implementation
   - Voice-to-text pipeline
   - Text-to-voice pipeline
   - Real-time processing

3. Chat Implementation
   - Message handling
   - Context management
   - Assistant switching
   - State preservation

4. Integration Layer
   - AIContext integration
   - AIF compliance
   - Error handling
   - Event system

5. Security Layer
   - Encryption implementation
   - Authentication integration
   - Privacy controls
   - Audit logging

6. Testing & Validation
   - Unit tests
   - Integration tests
   - Security testing
   - Performance testing

## DELIVERABLES
1. Complete TypeScript/React implementation
2. Security documentation
3. Integration tests
4. Performance benchmarks
5. User documentation

## VALIDATION CRITERIA
1. Real-time voice processing < 200ms latency
2. 99.9% uptime for chat functionality
3. Zero security vulnerabilities
4. WCAG 2.1 compliance
5. Successful integration with all specified LLM providers

Begin implementation following the specified phases. Provide status updates at each milestone.