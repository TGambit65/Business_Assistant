# Project Analysis & Prompt Generator

Use this prompt at the beginning of a new project or when significant changes have been made to have Roo Code analyze your codebase and generate optimized prompts.

```
Analyze this project and create a set of optimized prompts for future tasks.

Steps:
1. Analyze the codebase to identify the tech stack, architecture, and key patterns
2. Create a /prompts directory if it doesn't exist
3. Generate specialized prompt files for different task types
4. Include a prompt for periodic re-analysis

Each prompt should be optimized for the specific technologies detected and follow context-conservation best practices based on my project's complexity.
```

## When to use this

- When starting work on a new project
- After major architectural changes
- When adding new technologies to your stack
- Every 2-3 months during active development
- When experiencing prompt context overflow issues