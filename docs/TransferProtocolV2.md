# Transfer Protocol V2

## Command Activation

The Transfer Protocol is activated by the command:
```
Begin Transfer
```

When this command is received, all other operations MUST stop immediately and this protocol MUST be executed.

## Protocol Execution

1. IMMEDIATE ACTIONS:
   - Stop all current task execution
   - Save current state
   - Begin prompt review process

2. REVIEW PROCESS:
   - Scan all prompts in current chat
   - Identify incomplete tasks
   - Catalog pending enhancements
   - Note any error states
   - Document current progress

3. GENERATE AIF:
   - Create comprehensive AIF document
   - Include all incomplete tasks
   - Add current state metrics
   - Document all pending actions

4. GENERATE NEW CHAT PROMPT:
   - Read docs/NewChatInitialization.md
   - Replace [AIF_CODE_PLACEHOLDER] with current AIF
   - Format as a single, copy-paste ready prompt

5. PROVIDE INSTRUCTIONS:
   ```
   To continue this work:
   1. Create a new chat
   2. Copy and paste the COMPLETE prompt below
   3. Send "Resume" command
   ```

## AIF Structure

```json
{
  "metadata": {
    "contextFingerprint": "string",
    "taskProgress": "number",
    "modeState": "string",
    "timestamp": "string"
  },
  "preservedContext": {
    "activeFiles": ["string"],
    "decisions": [{
      "id": "string",
      "type": "string",
      "description": "string",
      "status": "string"
    }],
    "pendingActions": [{
      "id": "string",
      "type": "string",
      "description": "string",
      "priority": "string"
    }],
    "errorStates": [],
    "implementationProgress": {
      "component": "number"
    }
  },
  "continuationInstructions": {
    "nextActions": ["string"],
    "criticalConstraints": ["string"],
    "userPreferences": ["string"]
  },
  "qualityMetrics": {
    "metric": "number"
  }
}
```

## Resume Process

When receiving the "Resume" command:

1. IMMEDIATELY:
   - Load AIF context
   - Verify state integrity
   - Prioritize pending tasks
   - Begin execution of highest priority task

2. EXECUTION:
   - Follow standard tool use guidelines
   - Maintain error handling
   - Update task status
   - Document progress

3. COMPLETION:
   - Update AIF with new state
   - Document completed tasks
   - Prepare for next task

## Quality Assurance

VERIFY:
- All tasks are captured
- Progress is accurately recorded
- Constraints are preserved
- User preferences are maintained

## Error Handling

ON ERROR:
- Document error state
- Save current progress
- Include error details in AIF
- Provide recovery instructions

## Success Criteria

ENSURE:
- Zero context loss
- Complete task transfer
- Accurate state preservation
- Clear continuation path

## Output Format

The protocol MUST output:
1. A SINGLE, complete prompt containing:
   - Full initialization directive
   - Current AIF code in correct position
   - All necessary context
2. Simple "Resume" command instruction

## Example Output

```
Copy this COMPLETE prompt for your new chat:

# ABSOLUTE DIRECTIVE FOR NEW CHAT INITIALIZATION
[Complete initialization content with AIF]

After creating the new chat with this prompt, send:
Resume
```

This ensures a clean, documented transfer process with proper context preservation.