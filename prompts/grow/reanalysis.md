# Project Reanalysis Prompt Template

**Previous Tech Stack:** [Placeholder]
**Previous Project Complexity:** [Placeholder]

## Reanalysis Goal

Perform an updated analysis of the project to identify changes in the tech stack, architecture, complexity, and testing practices since the last analysis ([Date Placeholder]). Update prompt templates accordingly.

## Analysis Steps (Repeat of Phase 1)

1. Examine package manager files (`package.json`, `pyproject.toml`, etc.), build configurations, and other metadata.
2. Scan the directory structure for architectural patterns (MVC, microservices, component-based, etc.).
3. Analyze import statements and dependencies to identify frameworks and key libraries.
4. Examine test files (`*.test.*`, `*_spec.*`, etc.) to understand testing frameworks and practices.

## Output

- Summarize detected changes in tech stack, architecture, or complexity.
- If significant changes warrant updates to the prompt templates (`general_tasks.md`, `bug_fixing.md`, etc.), provide the necessary modifications using `apply_diff`.

## Tool Usage Suggestions

- Use `list_files` to get an overview of current project structure.
- Use `read_file` to examine key configuration and source files.
- Use `search_files` to track usage of new/old dependencies or patterns.
- Use `apply_diff` to update other prompt templates in `/prompts/grow/` if needed.