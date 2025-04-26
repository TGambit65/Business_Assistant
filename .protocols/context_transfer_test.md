# Context Transfer Protocol Test

## Protocol Version: 1.0

This protocol defines the procedure for transferring context between AI assistants or sessions. When triggered, follow these steps precisely in order.

## Execution Steps

1. **Pause Current Task**
   - Immediately suspend all ongoing operations on Task A
   - Save mental context of current code structure and logic flow
   - Mark current position in task execution for later resumption

2. **Analyze Current Context**
   - Identify all files currently being modified or analyzed
   - Extract key variables, functions, and classes relevant to Task A
   - Note any unresolved issues or decision points in the current task

3. **Generate Context Summary JSON**
   - Create a structured JSON object with the following format:
   ```json
   {
     "protocol_version": "1.0",
     "timestamp": "<current_timestamp>",
     "task_id": "Task A",
     "task_status": "paused",
     "files_in_context": ["<file1>", "<file2>", ...],
     "code_elements": {
       "variables": ["<var1>", "<var2>", ...],
       "functions": ["<func1>", "<func2>", ...],
       "classes": ["<class1>", "<class2>", ...]
     },
     "decision_points": ["<issue1>", "<issue2>", ...],
     "chat_history_summary": "<brief_summary_of_relevant_exchanges>"
   }
   ```

4. **Prepare Transfer Package**
   - Combine the JSON summary with relevant code snippets
   - Include any error messages or warnings encountered
   - Add metadata about the execution environment

5. **Execute Transfer**
   - Output the complete transfer package as a code block
   - Confirm successful generation of transfer package
   - Await further instructions for resuming Task A or transitioning to a new task

## Important Notes

- This protocol must be executed with high precision
- All context from Task A must be preserved during the transfer
- The protocol execution should be transparent to the user
- Upon completion, you should be ready to either resume Task A or begin a new task as directed

## Example Output

```
CONTEXT_TRANSFER_COMPLETE
{
  "protocol_version": "1.0",
  "timestamp": "2025-03-31T15:38:00Z",
  "task_id": "Task A",
  "task_status": "paused",
  "files_in_context": ["src/main.js", "src/utils.js"],
  "code_elements": {
    "variables": ["config", "apiClient"],
    "functions": ["processData", "fetchResults"],
    "classes": ["DataProcessor"]
  },
  "decision_points": ["Optimize the data processing algorithm", "Handle edge cases in API responses"],
  "chat_history_summary": "Working on implementing a data processing pipeline with error handling and performance optimization"
}