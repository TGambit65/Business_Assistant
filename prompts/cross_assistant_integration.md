# Cross-Assistant Integration Framework

This document provides a comprehensive framework for integrating multiple AI code assistants (primarily Roo Code and Cursor) to create seamless, powerful development workflows.

## 1. Assistant Interoperability Foundation

### Shared Understanding Protocol

The effectiveness of cross-assistant workflows depends on establishing a common "language" for sharing context, work state, and intent between different AI assistants.

```
PROTOCOL REQUIREMENTS:

1. Semantic Equivalence: Ensure consistent understanding of:
   - Code architecture concepts
   - Task classification taxonomy
   - State of completion indicators
   - Technical domain terminology

2. Context Preservation:
   - Essential project knowledge
   - Decision history and rationale
   - Implementation constraints
   - User preferences and style guidelines

3. Intent Transfer:
   - Current objective and success criteria
   - Stage in development workflow
   - Known limitations or challenges
   - Quality expectations
```

### Assistant Interchange Format (AIF)

AIF serves as the standardized interchange format between assistants, using a structured JSON format:

```json
{
  "metadata": {
    "version": "1.0",
    "source_assistant": "Roo|Cursor|Other",
    "target_assistant": "Roo|Cursor|Other",
    "task_id": "unique-task-identifier",
    "task_type": "bug_fix|feature|refactor|analysis|...",
    "project_fingerprint": "hash-of-key-project-files",
    "timestamp": "ISO-8601-timestamp",
    "confidence_score": 0.0-1.0
  },
  "context": {
    "tech_stack": ["framework1", "framework2", ...],
    "key_files": [
      {"path": "src/file.ts", "relevance": 0.95, "fingerprint": "file-hash"},
      {"path": "src/other.ts", "relevance": 0.82, "fingerprint": "file-hash"}
    ],
    "architecture_summary": "Concise description of system architecture",
    "requirements": "Task-specific requirements and constraints",
    "project_standards": "Coding conventions and standards summary",
    "user_preferences": {
      "style": "Preferences for code style",
      "approach": "Preferences for solution approach"
    }
  },
  "session_state": {
    "current_phase": "research|design|implementation|testing|review",
    "completion_percentage": 0-100,
    "active_files": ["file1.ts", "file2.ts", ...],
    "decisions": [
      {"topic": "Decision topic", "choice": "Selected approach", "rationale": "Reason for choice"},
      ...
    ],
    "rejected_approaches": [
      {"approach": "Approach description", "reason": "Rejection rationale"},
      ...
    ]
  },
  "work_product": {
    "analysis": "Technical analysis of the problem/task",
    "design": {
      "architecture": "High-level design",
      "components": ["component1", "component2", ...],
      "interfaces": ["interface1", "interface2", ...],
      "data_flow": "Description of data flow"
    },
    "implementation": {
      "changes": [
        {"file": "file1.ts", "description": "Change description", "status": "completed|in-progress|pending"},
        ...
      ],
      "new_files": [
        {"path": "new_file.ts", "purpose": "File purpose", "status": "completed|in-progress|pending"},
        ...
      ]
    },
    "testing": {
      "test_plan": "Testing approach",
      "test_cases": [
        {"description": "Test case", "status": "passed|failed|pending"},
        ...
      ],
      "coverage": "Test coverage description"
    }
  },
  "continuation": {
    "status": "complete|partial|blocked",
    "next_steps": [
      {"action": "Action description", "priority": 1-5},
      ...
    ],
    "blockers": [
      {"description": "Blocker description", "severity": 1-5},
      ...
    ],
    "remaining_work": "Description of what's left"
  }
}
```

## 2. Practical Integration Workflows

### Specialized Assistant Workflow

This workflow leverages each assistant's strengths for different phases of development:

```
WORKFLOW: Design (Roo) → Implementation (Cursor) → Testing (Roo)

PHASE 1: ARCHITECTURE & DESIGN (Roo Code)
1. User provides task requirements to Roo
2. Roo analyzes project structure and tech stack
3. Roo generates architecture and design specification
4. Roo creates implementation plan with detailed steps
5. Roo generates AIF document with design and plan
6. User initiates transfer to Cursor

TRANSITION:
- AIF document captures design decisions, component structure
- Architecture diagrams and interface definitions included
- Implementation plan converted to Cursor-compatible format

PHASE 2: IMPLEMENTATION (Cursor)
1. Cursor initializes with AIF from Roo
2. Cursor enters PLAN mode to review implementation steps
3. Cursor validates plan against current project state
4. Cursor enters EXECUTE mode for implementation
5. User guides and approves implementation steps
6. Cursor generates updated AIF with implementation details
7. User initiates transfer back to Roo

TRANSITION:
- AIF document updated with implementation details
- Code changes documented with file paths and summaries
- Status of implementation tasks updated

PHASE 3: TESTING & VALIDATION (Roo Code)
1. Roo initializes with updated AIF from Cursor
2. Roo analyzes implemented code against original design
3. Roo generates test cases based on requirements
4. Roo helps execute tests and analyze results
5. Roo suggests fixes for any issues found
6. Final documentation is generated
```

### Parallel Processing Workflow

This workflow enables simultaneous work across assistants for complex projects:

```
WORKFLOW: Concurrent Development with Synchronized Checkpoints

SETUP:
1. Decompose project into semi-independent components
2. Assign components to different assistants based on strengths
3. Establish shared context baseline via AIF
4. Define synchronization checkpoints

EXECUTION:
1. Each assistant works on assigned components
2. At checkpoints, AIFs are exchanged and merged
3. Conflicts are resolved with user guidance
4. Updated baseline is distributed to all assistants
5. Work continues with integrated context

INTEGRATION:
1. Final AIFs are combined into unified representation
2. Integration test plan is generated
3. Assistants collaborate on integration challenges
4. Final documentation captures full system
```

### Progressive Enhancement Workflow

This workflow allows gradual improvement of code through specialized passes:

```
WORKFLOW: Sequential Enhancement Pipeline

PHASE 1: FOUNDATION (Roo Code)
1. Implement basic functionality to meet requirements
2. Focus on correctness over optimization
3. Document structure and interfaces clearly
4. Generate AIF with implementation details

PHASE 2: OPTIMIZATION (Cursor)
1. Cursor receives AIF with foundation implementation
2. Identifies performance bottlenecks and inefficiencies 
3. Makes targeted optimizations while preserving behavior
4. Updates AIF with optimization rationale and metrics

PHASE 3: SECURITY ENHANCEMENT (Security-Specialized Assistant)
1. Receives updated AIF from previous phases
2. Performs security analysis on implementation
3. Applies security best practices and fixes vulnerabilities
4. Updates AIF with security enhancements

PHASE 4: FINALIZATION (Roo Code)
1. Receives fully enhanced AIF
2. Performs final integration and compatibility checks
3. Updates documentation with optimization and security notes
4. Delivers production-ready implementation
```

## 3. Implementation Guide

### Setting Up Roo Code for AIF Export

```typescript
// Example implementation for Roo Code AIF generation

class RooAifGenerator {
  constructor(projectAnalysis, taskContext) {
    this.projectAnalysis = projectAnalysis;
    this.taskContext = taskContext;
    this.workState = this.initializeWorkState();
  }
  
  initializeWorkState() {
    return {
      currentPhase: 'research',
      completionPercentage: 0,
      activeFiles: [],
      decisions: [],
      rejectedApproaches: []
    };
  }
  
  updateWorkState(updates) {
    Object.assign(this.workState, updates);
  }
  
  recordDecision(topic, choice, rationale) {
    this.workState.decisions.push({ topic, choice, rationale });
  }
  
  recordRejectedApproach(approach, reason) {
    this.workState.rejectedApproaches.push({ approach, reason });
  }
  
  generateMetadata() {
    return {
      version: '1.0',
      sourceAssistant: 'Roo',
      targetAssistant: 'Cursor', // Can be parameterized
      taskId: this.taskContext.taskId || generateUniqueId(),
      taskType: this.taskContext.taskType,
      projectFingerprint: this.generateProjectFingerprint(),
      timestamp: new Date().toISOString(),
      confidenceScore: this.calculateConfidenceScore()
    };
  }
  
  generateContextSection() {
    return {
      techStack: this.projectAnalysis.detectedTechnologies,
      keyFiles: this.projectAnalysis.relevantFiles.map(file => ({
        path: file.path,
        relevance: file.relevanceScore,
        fingerprint: this.calculateFileHash(file.path)
      })),
      architectureSummary: this.projectAnalysis.architectureSummary,
      requirements: this.taskContext.requirements,
      projectStandards: this.projectAnalysis.codingStandards,
      userPreferences: this.taskContext.userPreferences
    };
  }
  
  generateWorkProduct() {
    // Implementation would collect work done by Roo
    // This is just a simplified example
    return {
      analysis: this.taskContext.analysis || '',
      design: {
        architecture: this.taskContext.architecture || '',
        components: this.taskContext.components || [],
        interfaces: this.taskContext.interfaces || [],
        dataFlow: this.taskContext.dataFlow || ''
      },
      implementation: {
        changes: this.taskContext.changes || [],
        newFiles: this.taskContext.newFiles || []
      },
      testing: {
        testPlan: this.taskContext.testPlan || '',
        testCases: this.taskContext.testCases || [],
        coverage: this.taskContext.coverage || ''
      }
    };
  }
  
  generateContinuation() {
    return {
      status: this.taskContext.completionStatus,
      nextSteps: this.taskContext.nextSteps.map((step, index) => ({
        action: step,
        priority: this.taskContext.priorities?.[index] || 3
      })),
      blockers: this.taskContext.blockers.map((blocker, index) => ({
        description: blocker,
        severity: this.taskContext.blockerSeverity?.[index] || 3
      })),
      remainingWork: this.taskContext.remainingWork
    };
  }
  
  generateAif() {
    return {
      metadata: this.generateMetadata(),
      context: this.generateContextSection(),
      sessionState: this.workState,
      workProduct: this.generateWorkProduct(),
      continuation: this.generateContinuation()
    };
  }
  
  // Helper methods would be implemented here
  generateProjectFingerprint() {/* implementation */}
  calculateFileHash(path) {/* implementation */}
  calculateConfidenceScore() {/* implementation */}
}
```

### Configuring Cursor for AIF Import

```typescript
// Example implementation for Cursor processing AIF

class CursorAifProcessor {
  constructor() {
    this.currentAif = null;
    this.cursorMode = 'RESEARCH'; // Default mode
  }
  
  loadAif(aifJson) {
    try {
      this.currentAif = typeof aifJson === 'string' 
        ? JSON.parse(aifJson)
        : aifJson;
      
      this.validateAif();
      this.determineMode();
      return true;
    } catch (err) {
      console.error('Failed to load AIF:', err);
      return false;
    }
  }
  
  validateAif() {
    // Implement validation logic for required fields
    const requiredSections = ['metadata', 'context', 'workProduct'];
    for (const section of requiredSections) {
      if (!this.currentAif[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }
  }
  
  determineMode() {
    // Map AIF phase to Cursor RIPER mode
    const phaseToMode = {
      'research': 'RESEARCH',
      'design': 'INNOVATE',
      'implementation': 'EXECUTE',
      'testing': 'REVIEW'
    };
    
    // Default to current phase if present
    if (this.currentAif.sessionState?.currentPhase) {
      const phase = this.currentAif.sessionState.currentPhase;
      this.cursorMode = phaseToMode[phase] || 'RESEARCH';
      return;
    }
    
    // Otherwise infer from work product completeness
    if (this.currentAif.workProduct.implementation?.changes?.length > 0) {
      this.cursorMode = 'EXECUTE';
    } else if (this.currentAif.workProduct.design?.architecture) {
      this.cursorMode = 'PLAN';
    } else if (this.currentAif.workProduct.analysis) {
      this.cursorMode = 'INNOVATE';
    } else {
      this.cursorMode = 'RESEARCH';
    }
  }
  
  generateRiperInitialization() {
    const modeSwitchCommand = `ENTER ${this.cursorMode} MODE`;
    
    // Generate initialization content based on current mode
    let initialization = `${modeSwitchCommand}\n\n`;
    
    // Add relevant context based on determined mode
    switch (this.cursorMode) {
      case 'RESEARCH':
        initialization += this.generateResearchContext();
        break;
      case 'INNOVATE':
        initialization += this.generateInnovateContext();
        break;
      case 'PLAN':
        initialization += this.generatePlanContext();
        break;
      case 'EXECUTE':
        initialization += this.generateExecuteContext();
        break;
      case 'REVIEW':
        initialization += this.generateReviewContext();
        break;
    }
    
    return initialization;
  }
  
  // Methods to generate appropriate content for each mode
  generateResearchContext() {
    return `
# Project Context
Tech Stack: ${this.currentAif.context.techStack.join(', ')}

## Key Files
${this.currentAif.context.keyFiles.map(f => `- ${f.path} (relevance: ${f.relevance})`).join('\n')}

## Architecture Summary
${this.currentAif.context.architectureSummary}

## Research Objective
${this.currentAif.workProduct.analysis || 'Analyze the current codebase to understand the structure and identify components relevant to the task.'}
`;
  }
  
  generateInnovateContext() {
    return `
# Project Context
Tech Stack: ${this.currentAif.context.techStack.join(', ')}

## Architecture Summary
${this.currentAif.context.architectureSummary}

## Current Analysis
${this.currentAif.workProduct.analysis}

## Design Objective
Generate multiple approaches for implementation, considering:
- Performance implications
- Maintainability
- Integration with existing architecture
- Alignment with project standards

## User Preferences
${this.currentAif.context.userPreferences?.approach || 'No specific preferences provided.'}
`;
  }
  
  generatePlanContext() {
    // Implementation for PLAN mode context
    // Similar pattern to above methods
  }
  
  generateExecuteContext() {
    // Implementation for EXECUTE mode context
  }
  
  generateReviewContext() {
    // Implementation for REVIEW mode context
  }
  
  updateAifFromCursorOutput(cursorOutput) {
    // Logic to update AIF based on Cursor's outputs
    // This would parse Cursor's response and update relevant AIF sections
  }
  
  generateAifForExport() {
    // Update AIF with latest state from Cursor
    return {
      ...this.currentAif,
      metadata: {
        ...this.currentAif.metadata,
        sourceAssistant: 'Cursor',
        timestamp: new Date().toISOString()
      },
      // Update other relevant sections
    };
  }
}
```

### User Interface Integration Components

```jsx
// React component example for AIF transfer UI

import React, { useState } from 'react';

const AssistantTransfer = ({ currentAssistant, aifData, onTransfer }) => {
  const [targetAssistant, setTargetAssistant] = useState('');
  const [transferReason, setTransferReason] = useState('');
  
  const handleTransfer = () => {
    // Prepare AIF for transfer
    const updatedAif = {
      ...aifData,
      metadata: {
        ...aifData.metadata,
        sourceAssistant: currentAssistant,
        targetAssistant,
        timestamp: new Date().toISOString()
      },
      transferReason
    };
    
    onTransfer(updatedAif, targetAssistant);
  };
  
  return (
    <div className="assistant-transfer-panel">
      <h3>Transfer to Another Assistant</h3>
      
      <div className="form-group">
        <label>Current Progress:</label>
        <div className="progress-indicator">
          <div 
            className="progress-bar" 
            style={{width: `${aifData.sessionState.completionPercentage}%`}}
          />
          <span>{aifData.sessionState.completionPercentage}% Complete</span>
        </div>
      </div>
      
      <div className="form-group">
        <label>Current Phase:</label>
        <div className="phase-badge">
          {aifData.sessionState.currentPhase}
        </div>
      </div>
      
      <div className="form-group">
        <label>Transfer To:</label>
        <select 
          value={targetAssistant} 
          onChange={(e) => setTargetAssistant(e.target.value)}
        >
          <option value="">Select Assistant</option>
          <option value="Roo">Roo Code</option>
          <option value="Cursor">Cursor</option>
          <option value="Other">Other Assistant</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Transfer Reason:</label>
        <textarea
          value={transferReason}
          onChange={(e) => setTransferReason(e.target.value)}
          placeholder="Why are you transferring to this assistant?"
          rows={3}
        />
      </div>
      
      <div className="transfer-summary">
        <h4>Transfer Summary</h4>
        <ul>
          <li>Key Files: {aifData.context.keyFiles.length}</li>
          <li>Decisions Made: {aifData.sessionState.decisions.length}</li>
          <li>Changes: {aifData.workProduct.implementation.changes.length}</li>
          <li>Next Steps: {aifData.continuation.nextSteps.length}</li>
        </ul>
      </div>
      
      <button 
        onClick={handleTransfer}
        disabled={!targetAssistant}
        className="transfer-button"
      >
        Transfer to {targetAssistant || 'Selected Assistant'}
      </button>
    </div>
  );
};

export default AssistantTransfer;
```

## 4. Assistant Comparison Matrix

Understanding the strengths of each assistant helps optimize task allocation:

| Capability | Roo Code | Cursor | Optimal Use |
|------------|----------|--------|-------------|
| Project Analysis | Strong | Moderate | Use Roo for initial codebase analysis |
| Architecture Design | Strong | Moderate | Use Roo for system design tasks |
| Code Implementation | Moderate | Strong | Use Cursor for implementation tasks |
| Refactoring | Moderate | Strong | Use Cursor for complex refactorings |
| Testing | Strong | Moderate | Use Roo for test creation and validation |
| Documentation | Strong | Moderate | Use Roo for documentation generation |
| Real-time Collaboration | Limited | Strong | Use Cursor for pair programming |
| Learning Curve | Moderate | Lower | Start with Cursor for beginners |

## 5. Common Integration Challenges

### Challenge: Context Drift

When transferring between assistants multiple times, context can gradually drift from the original understanding.

**Solution:**
- Implement context verification checksums for key files
- Include original requirements in every transfer
- Periodically regenerate full context from source
- User verification prompts at key transition points

### Challenge: Inconsistent Mental Models

Different assistants may develop different "mental models" of the same code.

**Solution:**
- Use explicit architecture diagrams in AIF
- Include code structure maps with relationship definitions
- Apply standardized code annotation patterns
- Transfer explicit constraints and assumptions

### Challenge: Progress Tracking Misalignment

Assistants may have different metrics for "percent complete" or task status.

**Solution:**
- Standardize progress metrics across assistants
- Use explicit completion criteria for subtasks
- Track status at file/feature level rather than overall
- Reset expectations at each transfer point

## 6. Best Practices

### Workflow Planning

1. **Task Decomposition**
   - Break tasks into assistant-appropriate chunks
   - Define clear handoff points with verifiable outputs
   - Create checklists for each assistant phase

2. **Context Management**
   - Prioritize transferring decisions over raw code
   - Include rationale for key technical choices
   - Preserve alternative approaches that were considered

3. **Verification**
   - Add verification steps after each transfer
   - Compare output against original requirements
   - Validate technical choices against standards

### Maximizing AIF Efficiency

1. **Contextual Compression**
   - Use summaries and structure over full text
   - Include fingerprints/hashes for verification
   - Transfer diffs rather than full files when possible

2. **Progressive Enhancement**
   - Start with minimal AIF and expand as needed
   - Include only the most relevant files
   - Target 80% context coverage as optimal

## 7. Future Directions

### Enhanced Integration Opportunities

1. **Shared Vector Knowledge Base**
   - Assistants contribute to shared embedding space
   - Common understanding of code semantics
   - Aligned with specific project vocabulary

2. **Proactive Task Routing**
   - Automatic task classification
   - Optimal assistant selection based on task type
   - Routing suggestions presented to user

3. **Federated Learning**
   - Assistants learn from each other's strengths
   - Project-specific optimizations shared
   - Performance feedback loop

4. **Standardization Efforts**
   - Industry standard for assistant interchange
   - Common metrics for effectiveness
   - Certified compatibility between systems