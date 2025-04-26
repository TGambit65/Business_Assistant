# Security Audit Prompt Template

**Tech Stack:** [Auto-Detected Stack Placeholder]
**Project Complexity:** [Auto-Detected Complexity Placeholder] (Context Threshold: [Threshold Placeholder]%)

## Audit Focus

[Placeholder for specific security area: e.g., input validation, authentication/authorization, dependency vulnerabilities, XSS, CSRF, SQL injection]

## Context Requirements

- Provide relevant file paths:
    - Authentication modules/routes
    - Input handling code (forms, API endpoints)
    - Database interaction code
    - `package.json`, `package-lock.json` (or equivalent)
- Include code snippets for:
    - User input processing
    - Authentication checks
    - Database queries
    - Session management

## Tool Usage Suggestions

- Use `read_file` to examine sensitive code paths.
- Use `search_files` to find potentially insecure patterns (e.g., raw SQL queries, unvalidated input usage - Regex: [Regex Placeholder]).
- Use `execute_command` to run security scanning tools (e.g., `npm audit`, `snyk`).
- Use `apply_diff` to patch vulnerabilities.