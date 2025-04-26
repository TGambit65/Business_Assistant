# Cursor Rule Prompts

This directory contains custom rules to optimize Claude's performance in Cursor for this project.

## Files in this Directory

1. `enhanced_riper5_general.md` - An improved version of Riper-5 for general use
2. `email_assistant_project_rule.md` - Project-specific rules for this email assistant

## How to Use These Rules

### Setting up the General Rule

1. Open Cursor settings
2. Navigate to Claude settings
3. Find "Custom Instructions" or "General Rules"
4. Copy the **entire contents** of `enhanced_riper5_general.md`
5. Paste into the General Rules field and save

### Setting up the Project Rule

1. Open Cursor settings
2. Navigate to Claude settings 
3. Find "Project Rules" (may be in Project Settings section)
4. Copy the **entire contents** of `email_assistant_project_rule.md`
5. Paste into the Project Rules field and save

## Key Features

### Enhanced Context Management
- **Adaptive Thresholds**: Different thresholds (40-75%) based on task complexity
- **Warning Signs**: Proactive identification of context issues
- **Continuation Prompts**: Structured prompt design for new tasks that preserves critical context
- **Efficient Handoffs**: Ensures critical information carries over between conversations

### Structured Development
- **Mode-Based Workflow**: Clear separation of concerns (RESEARCH, INNOVATE, PLAN, EXECUTE, REVIEW)
- **Adaptive Patterns**: Different approaches for simple, moderate, and complex tasks
- **Checkpoint System**: Verification steps for complex implementations

### Project-Specific Knowledge
- **Tech Stack Awareness**: Understanding of frameworks and libraries in use
- **Key Directories**: Knowledge of important project locations
- **Critical Patterns**: Focus on maintaining security, testing practices, and architectural patterns
- **Common Issues**: Awareness of typical problems to avoid (React testing mistakes, TypeScript issues)

## Benefits of This Approach

- **Structured Development**: The enhanced Riper-5 provides a clear workflow while being more flexible
- **Project-Specific Knowledge**: Claude will understand the specific architecture of this email assistant
- **Adaptive Task Handling**: Different complexity levels get appropriate treatment
- **Security Focus**: Special emphasis on maintaining security patterns in this application
- **Testing Guidance**: Clear instructions on React testing patterns that prevent common issues
- **Efficient Context Management**: Prevents timeouts and wasted compute by managing context size

## When to Update These Rules

### General Rule
- When you want to adjust the overall development methodology
- When you find Claude is being too rigid or too flexible
- When you change your general preferences for collaboration

### Project Rule
- When adding new major dependencies
- After architectural changes
- After significant refactoring
- When the team agrees on new best practices
- Periodically (e.g., quarterly) during active development

## Re-analyzing the Project

To update the project rule after significant changes, ask Claude:

```
Analyze the current state of the email assistant project and update the project-specific rule to reflect architectural changes, new patterns, or technology additions.
```

Claude will examine the current codebase and generate an updated project rule.