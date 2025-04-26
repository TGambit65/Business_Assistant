# Project Reanalysis

This prompt is designed to trigger a periodic reanalysis of your project as it evolves:

```
Analyze this project and update all prompt templates to reflect the current architecture and best practices.

## When to use this prompt
- After adding new major dependencies
- After architectural changes
- After significant refactoring
- Every 2-3 months during active development
- When the current prompt templates no longer match the codebase

## Analysis Instructions
1. Perform a complete analysis of the current codebase
2. Identify any new technologies, patterns, or practices introduced
3. Update all existing prompt templates in the /prompts directory
4. Generate any new prompt templates that may be needed
5. Focus particularly on:
   - Changes to the tech stack
   - New architectural patterns
   - Updated testing practices
   - New directories or code organization
   - Changes in common error patterns

## Special Considerations
- Preserve any custom sections users have added to prompts
- Note any major changes in a "What's New" section
- Update any tool usage recommendations based on observed patterns
- Adjust complexity thresholds if project scope has changed

## Expected outcome
The /prompts directory will contain updated templates that accurately reflect
the current state of the codebase, enabling more effective assistance.
```

## How to use this prompt:
1. Copy the entire block between the triple backticks
2. Send to Roo Code at the beginning of a reanalysis session
3. Allow Roo to examine the codebase completely before making changes
4. Review the updated prompt files to understand any new patterns or recommendations

## Recommended reanalysis schedule:
- For rapid development: Monthly
- For steady development: Quarterly
- After major version updates
- After introducing new frameworks or libraries
- When you notice prompt advice becoming less relevant