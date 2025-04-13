# MASTER AGENT INITIALIZATION PROMPT
Version: 1.0
Task: Voice and Chat Agent Implementation with Multi-LLM Research Integration

## 1. PROJECT CONTEXT
Tech Stack: TypeScript, React
Architecture: Frontend service-based
Integration Points: AI services, AIF (Assistant Interchange Format)
Security Level: High
UX Priority: Critical

## 2. CORE COMPONENTS

### 2.1 Voice Agent Requirements
- Bidirectional voice communication
- Voice-to-text and text-to-voice conversion
- Encrypted context preservation
- AIContext interface integration
- WebRTC secure implementation
- Privacy-focused voice processing

### 2.2 Chat Agent Requirements
- AIComposeAssistant structure integration
- AIF-compliant state management
- Encrypted session preservation
- Secure assistant switching
- Real-time synchronization
- Zero-knowledge storage

## 3. OPTIMIZATION PARAMETERS
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

## 4. MULTI-LLM RESEARCH PROTOCOL

### 4.1 Research Request Format
{
  "metadata": {
    "taskType": "research_and_planning",
    "contextFingerprint": "voice_chat_agent_development",
    "priority": "high",
    "requiredExpertise": ["WebRTC", "Voice Processing", "Security", "UX Design"]
  },
  "researchQuestions": {
    "external_services_analysis": {
      "voice_processing": [
        "Recommended voice-to-text services with comparison metrics",
        "Text-to-speech service options with quality analysis",
        "WebRTC service providers with security features",
        "Voice data processing platforms with privacy focus"
      ],
      "security_services": [
        "End-to-end encryption service providers",
        "Authentication service recommendations",
        "Security monitoring solutions",
        "Compliance verification services"
      ],
      "storage_solutions": [
        "Zero-knowledge storage providers",
        "Secure session storage services",
        "Real-time database options",
        "Backup and redundancy services"
      ]
    },
    "security_deep_dive": [
      "Voice data encryption standards",
      "Zero-knowledge storage implementation",
      "Voice biometric verification",
      "Data exfiltration prevention",
      "Prompt injection protection",
      "Regulatory compliance"
    ],
    "user_experience_deep_dive": [
      "Cognitive load optimization",
      "Accessibility compliance",
      "Accent/dialect handling",
      "Context preservation",
      "Error recovery patterns",
      "Natural conversation flow"
    ]
  }
}

### 4.2 Required Response Format (AIF)
{
  "metadata": {
    "respondingAssistant": "string",
    "confidenceScore": "number",
    "researchTimestamp": "ISO timestamp",
    "specializations": ["array"]
  },
  "serviceRecommendations": {
    "voiceProcessing": {
      "recommendations": [
        {
          "serviceName": "string",
          "description": "string",
          "strengthsJustification": ["array of specific strengths"],
          "weaknessesJustification": ["array of potential drawbacks"],
          "costAnalysis": "string",
          "securityAssessment": "string",
          "confidenceScore": "number",
          "alternativeOptions": ["array of alternatives"],
          "implementationComplexity": "string",
          "communitySupport": "string",
          "relevantExperiences": ["array of case studies or examples"]
        }
      ]
    },
    "security": {
      "recommendations": [
        {
          "serviceName": "string",
          "description": "string",
          "complianceStandards": ["array of supported standards"],
          "securityFeatures": ["array of key features"],
          "implementationRequirements": "string",
          "costBenefitAnalysis": "string",
          "confidenceScore": "number",
          "marketPosition": "string",
          "integrationComplexity": "string",
          "supportQuality": "string"
        }
      ]
    },
    "storage": {
      "recommendations": [
        {
          "serviceName": "string",
          "description": "string",
          "privacyFeatures": ["array of privacy capabilities"],
          "scalabilityAnalysis": "string",
          "performanceMetrics": "string",
          "costStructure": "string",
          "confidenceScore": "number",
          "technicalLimitations": ["array of limitations"],
          "successStories": ["array of relevant implementations"]
        }
      ]
    }
  },
  "research": {
    "security": {
      "findings": ["array"],
      "risks": ["array"],
      "mitigations": ["array"],
      "confidenceMetrics": {
        "recommendation": "number",
        "implementation": "number"
      }
    },
    "userExperience": {
      "findings": ["array"],
      "patterns": ["array"],
      "accessibility": ["array"],
      "confidenceMetrics": {
        "recommendation": "number",
        "implementation": "number"
      }
    }
  },
  "continuation": {
    "openQuestions": ["array"],
    "suggestedNextSteps": ["array"],
    "riskAreas": ["array"],
    "integrationConsiderations": ["array of integration challenges and solutions"]
  },
  "reasoningExplanation": {
    "methodologyUsed": "string - explanation of how conclusions were reached",
    "dataSourcesCited": ["array of sources consulted"],
    "assumptionsMade": ["array of key assumptions"],
    "confidenceLevels": {
      "overall": "number",
      "byCategory": {
        "technical": "number",
        "security": "number",
        "cost": "number",
        "implementation": "number"
      }
    },
    "decisionFactors": ["array of key factors that influenced recommendations"]
  }
}

## 5. IMPLEMENTATION STRATEGY

### 5.1 Phase 1: Foundation
1. Core interfaces definition
2. Security architecture implementation
3. Base component structure
4. AIF integration layer

### 5.2 Phase 2: Voice Processing
1. WebRTC secure setup
2. Voice conversion services
3. Encryption implementation
4. Context management

### 5.3 Phase 3: Chat Integration
1. State management
2. Assistant switching
3. Session preservation
4. Real-time sync

### 5.4 Phase 4: Security & UX
1. Security hardening
2. Accessibility implementation
3. Performance optimization
4. User flow refinement

## 6. VALIDATION REQUIREMENTS

### 6.1 Security Validation
- Encryption verification
- Penetration testing
- Compliance audit
- Privacy assessment

### 6.2 UX Validation
- Accessibility testing
- Performance metrics
- User flow analysis
- Error handling verification

## 7. DELIVERABLES

### 7.1 Code Components
- Voice Agent implementation
- Chat Agent implementation
- Security Manager integration
- UX Components

### 7.2 Documentation
- Security architecture
- Implementation guide
- API documentation
- User guide

### 7.3 Test Suite
- Unit tests
- Integration tests
- Security tests
- UX test scenarios

## 8. SUCCESS CRITERIA
1. All security requirements met
2. WCAG 2.1 compliance achieved
3. Performance targets reached
4. AIF compatibility verified
5. All tests passing
6. Documentation complete

## 9. CONTINUATION PROTOCOL
- Maintain AIF state
- Preserve security context
- Track implementation progress
- Document decisions
- Flag blocking issues
- Update research findings

## 10. RESPONSE REQUIREMENTS FOR OTHER LLMs
1. Provide detailed justification for EVERY recommendation
2. Include specific examples of successful implementations
3. Cite relevant case studies or documentation
4. Explain trade-offs between different options
5. Quantify confidence levels for each recommendation
6. Address potential integration challenges
7. Consider cost-benefit analysis
8. Evaluate community support and ecosystem
9. Assess long-term maintenance implications
10. Compare with alternative solutions

BEGIN IMPLEMENTATION
- Start with security architecture
- Integrate research findings as received
- Maintain AIF compatibility
- Prioritize security and UX
- Report progress at milestones
- Evaluate all service recommendations with detailed justifications
- Compare recommended solutions against project requirements
- Document reasoning behind each technical decision
