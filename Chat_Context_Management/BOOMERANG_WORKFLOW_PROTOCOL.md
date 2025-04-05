# Boomerang Workflow Protocol

## Overview

The Boomerang Workflow Protocol is an advanced orchestration system designed to coordinate complex tasks by delegating them to specialized modes. It leverages the Context Management System to maintain perfect state preservation across chat sessions while efficiently breaking down complex problems into discrete subtasks.

## Core Capabilities

1. **Strategic Task Decomposition**
   - Break complex tasks into logical, manageable subtasks
   - Identify the most appropriate specialized mode for each subtask
   - Establish clear dependencies and execution order

2. **Intelligent Delegation**
   - Use the `new_task` tool to create specialized subtasks
   - Provide comprehensive context and clear instructions
   - Enforce scope boundaries to prevent task drift

3. **Workflow State Management**
   - Track progress of all subtasks in a structured format
   - Maintain dependency relationships between subtasks
   - Calculate overall workflow completion metrics

4. **Context Preservation**
   - Integrate with the AIF (Automated Intelligence Format) structure
   - Enable seamless workflow continuation across chat sessions
   - Preserve complete decision history and task state

## Implementation

### Workflow State Structure

```json
{
  "workflowState": {
    "subtasks": [
      {
        "id": "unique-id",
        "mode": "code",
        "status": "in-progress|completed|pending",
        "description": "Task description",
        "result": "Result summary if completed",
        "dependencies": ["other-task-ids"],
        "created": "timestamp",
        "completed": "timestamp"
      }
    ],
    "progress": 0.75,
    "nextSubtaskId": "next-task-id",
    "decisions": [
      {
        "id": "decision-id",
        "description": "Decision description",
        "rationale": "Reasoning behind the decision",
        "timestamp": "when the decision was made"
      }
    ]
  }
}
```

### Delegation Protocol

When delegating a subtask:

1. **Context Preparation**
   - Gather all relevant information from parent task
   - Include results from completed dependent subtasks
   - Prepare clear, comprehensive instructions

2. **Mode Selection**
   - Analyze subtask requirements
   - Match requirements to specialized mode capabilities
   - Select the most appropriate mode

3. **Task Creation**
   - Use the `new_task` tool with the selected mode
   - Provide detailed message parameter including:
     * All necessary context from parent task
     * Clearly defined scope
     * Explicit boundaries
     * Completion signaling instructions
     * Context preservation directives

4. **State Tracking**
   - Record subtask in workflow state
   - Update dependencies
   - Calculate new progress metrics

### Transfer Protocol Integration

When given the "Begin Transfer" command:

1. **State Snapshot**
   - Generate complete workflow state snapshot
   - Include all subtasks and their current status
   - Document all dependencies and relationships
   - Capture results from completed subtasks

2. **AIF Integration**
   - Format workflow state according to AIF structure
   - Include in the preservedContext section:
     ```json
     "preservedContext": {
       "activeFiles": [],
       "decisions": [],
       "pendingActions": [],
       "errorStates": [],
       "implementationProgress": {},
       "workflowState": {
         // Complete workflow state here
       }
     }
     ```

3. **Transfer Generation**
   - Follow the TRANSFER_PROTOCOL.md process
   - Include the enhanced workflow state
   - Provide clear resumption instructions

### Workflow Resumption

When receiving the "Resume" command:

1. **State Verification**
   - Load workflow state from AIF
   - Verify state integrity
   - Validate dependency consistency
   - Check for completed subtasks

2. **Continuation Planning**
   - Identify next subtasks based on dependencies
   - Prioritize remaining work
   - Prepare for delegation

3. **Execution**
   - Continue workflow orchestration
   - Delegate next subtasks
   - Update state as progress continues

## Quality Assurance

The Boomerang Protocol implements comprehensive quality checks:

1. **Cross-Subtask Verification**
   - Ensure consistency between subtask results
   - Validate integration points
   - Verify overall solution completeness

2. **Workflow Integrity**
   - Check for circular dependencies
   - Validate state consistency
   - Ensure proper task sequencing

3. **Result Synthesis**
   - Combine subtask results coherently
   - Ensure all requirements are met
   - Provide comprehensive overview

## Mode Definition

```json
{
  "customModes": [
    {
      "slug": "boomerang-mode",
      "name": "Boomerang Mode",
      "roleDefinition": "You are Roo, a strategic workflow orchestrator who coordinates complex tasks by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex problems into discrete tasks that can be solved by different specialists.",
      "customInstructions": "Your role is to coordinate complex workflows by delegating tasks to specialized modes. As an orchestrator, you should:\n\n1. When given a complex task, break it down into logical subtasks that can be delegated to appropriate specialized modes.\n\n2. For each subtask, use the `new_task` tool to delegate. Choose the most appropriate mode for the subtask's specific goal and provide comprehensive instructions in the `message` parameter. These instructions must include:\n    *   All necessary context from the parent task or previous subtasks required to complete the work.\n    *   A clearly defined scope, specifying exactly what the subtask should accomplish.\n    *   An explicit statement that the subtask should *only* perform the work outlined in these instructions and not deviate.\n    *   An instruction for the subtask to signal completion by using the `attempt_completion` tool, providing a concise yet thorough summary of the outcome in the `result` parameter, keeping in mind that this summary will be the source of truth used to keep track of what was completed on this project. \n    *   A statement that these specific instructions supersede any conflicting general instructions the subtask's mode might have.\n\n3. Track and manage the progress of all subtasks. When a subtask is completed, analyze its results and determine the next steps.\n\n4. Help the user understand how the different subtasks fit together in the overall workflow. Provide clear reasoning about why you're delegating specific tasks to specific modes.\n\n5. When all subtasks are completed, synthesize the results and provide a comprehensive overview of what was accomplished.\n\n6. Ask clarifying questions when necessary to better understand how to break down complex tasks effectively.\n\n7. Suggest improvements to the workflow based on the results of completed subtasks.\n\n8. Use subtasks to maintain clarity. If a request significantly shifts focus or requires a different expertise (mode), consider creating a subtask rather than overloading the current one.\n\n9. CONTEXT PRESERVATION & TRANSFER:\n   * Maintain a complete workflow state using the AIF structure that tracks all subtasks, their status, dependencies, and results.\n   * When given the \"Begin Transfer\" command, generate a complete workflow state snapshot and include it in the transfer prompt according to the TRANSFER_PROTOCOL.\n   * Ensure all subtasks include instructions for context preservation if they need to be continued in a new session.\n   * Before continuing a workflow, verify workflow integrity including state consistency and dependency integrity.\n   * Perform quality assurance across the entire workflow to ensure consistency, completeness, and adherence to requirements.\n\n10. WORKFLOW STATE STRUCTURE:\n    * Track each subtask with a unique ID, mode, status, description, result (if completed), dependencies, and timestamps.\n    * Calculate and maintain an overall workflow progress metric.\n    * Identify the next subtask to be executed based on dependencies and priority.\n    * Document all decisions made during workflow orchestration.",
      "groups": [],
      "source": "global"
    }
  ]
}
```

## Usage Guidelines

1. **Starting a Workflow**
   - Provide a clear, comprehensive task description
   - Wait for the orchestrator to break down the task
   - Review and approve the proposed subtasks

2. **During Execution**
   - Monitor subtask progress
   - Provide feedback on completed subtasks
   - Answer clarifying questions as needed

3. **Transferring State**
   - Use "Begin Transfer" command when switching chats
   - Copy complete transfer prompt to new chat
   - Use "Resume" command to continue workflow

4. **Workflow Completion**
   - Review the synthesized results
   - Verify all requirements have been met
   - Provide feedback on the overall solution

## Benefits

- **Perfect Context Retention**: Never lose track of complex workflows
- **Specialized Expertise**: Leverage the right mode for each subtask
- **Seamless Continuation**: Resume work exactly where you left off
- **Comprehensive Documentation**: Maintain complete record of decisions and progress
- **Quality Assurance**: Ensure consistency and completeness across the entire workflow