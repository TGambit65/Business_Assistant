# Project Analyzer Implementation

This is the internal implementation document that Roo Code uses when executing the project analysis prompt.

## Phase 1: Tech Stack Analysis

```
I'll analyze this project to identify the tech stack and architecture patterns:

1. First, I'll examine package.json, build configurations, and other metadata files
2. Next, I'll scan the directory structure to identify architectural patterns
3. Then I'll analyze import statements and dependencies to identify frameworks
4. Finally, I'll examine test files to understand testing practices
```

## Phase 2: Prompt Generation Guidelines

For each task type, prompts will:
1. Include detected tech stack in the header
2. Specify appropriate context threshold based on project complexity
3. Provide tool usage patterns optimized for the stack
4. Include common directories and file patterns relevant to each task type

## Prompt Templates

I'll create these prompt files in the /prompts/grow directory:

1. `general_tasks.md` - For everyday development tasks
2. `bug_fixing.md` - Specialized for debugging and issue resolution
3. `feature_development.md` - For adding new capabilities
4. `testing_tasks.md` - For test creation and maintenance
5. `refactoring.md` - For code improvement without changing behavior
6. `performance_optimization.md` - For speed and efficiency improvements
7. `security_audit.md` - For identifying and fixing security issues
8. `reanalysis.md` - Instructions for periodic project reanalysis

## Automatic Complexity Detection

Project complexity is determined by:
- Number of dependencies and frameworks
- Directory depth and structure
- Presence of advanced patterns (microservices, state management)
- Testing sophistication
- TypeScript usage and type complexity

Threshold recommendations:
- Simple: 40-50% context threshold
- Moderate: 55-65% context threshold
- Complex: 65-75% context threshold