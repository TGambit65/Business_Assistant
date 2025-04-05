# Bug Fixing Prompt Template

**Tech Stack:** [Auto-Detected Stack Placeholder]
**Project Complexity:** [Auto-Detected Complexity Placeholder] (Context Threshold: [Threshold Placeholder]%)

## Bug Description

[Placeholder for bug description, error messages, steps to reproduce]

## Context Requirements

- Provide relevant file paths:
    - [Error Source Dir Placeholder]/
    - [Related Module Dir Placeholder]/
    - [Common File Pattern Placeholder: e.g., *.test.js]
- Include code snippets for:
    - Function/method where error occurs
    - Calling functions/methods
    - Relevant data structures/types

## Tool Usage Suggestions

- Use `read_file` to examine error source and related files.
- Use `search_files` to find usages of failing functions/variables (Regex: [Regex Placeholder]).
- Use `apply_diff` to apply targeted fixes.
- Consider `execute_command` to run tests (`npm test` or specific test file).