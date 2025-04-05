# Testing Tasks Prompt Template

**Tech Stack:** [Auto-Detected Stack Placeholder] (Testing Framework: [Framework Placeholder])
**Project Complexity:** [Auto-Detected Complexity Placeholder] (Context Threshold: [Threshold Placeholder]%)

## Testing Goal

[Placeholder for testing objective: e.g., write unit tests for X, create integration test for Y, fix failing test Z]

## Context Requirements

- Provide file path for the code to be tested:
    - [Source File Path Placeholder]
- Provide file path for the test file (if existing):
    - [Test File Path Placeholder]
- Include code snippets for:
    - Function/method/component under test
    - Existing related tests (if any)
    - Dependencies that might need mocking

## Tool Usage Suggestions

- Use `read_file` to examine source code and existing tests.
- Use `write_to_file` to create new test files.
- Use `insert_content` or `apply_diff` to add/modify tests in existing files.
- Use `execute_command` to run tests (`npm test`, `jest path/to/test.js`, etc.).
- Use `search_files` to find examples of existing tests or mocks.