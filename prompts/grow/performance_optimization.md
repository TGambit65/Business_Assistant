# Performance Optimization Prompt Template

**Tech Stack:** [Auto-Detected Stack Placeholder]
**Project Complexity:** [Auto-Detected Complexity Placeholder] (Context Threshold: [Threshold Placeholder]%)

## Optimization Goal

[Placeholder for performance goal: e.g., reduce load time of page X, optimize database query Y, improve responsiveness of component Z]
**Metrics:** [Specify how improvement will be measured, e.g., Lighthouse score, query execution time, frame rate]

## Context Requirements

- Provide file path(s) for the code/area to be optimized:
    - [Source File Path 1 Placeholder]
    - [Related File Path Placeholder] (e.g., component using a slow service)
- Include code snippets for:
    - The specific code suspected of being slow
    - Relevant configurations (e.g., build settings, database config)
- Provide performance analysis data if available (e.g., profiler output, network waterfall chart).

## Tool Usage Suggestions

- Use `read_file` to analyze the relevant code paths.
- Use `apply_diff` for targeted optimizations.
- Use `search_files` to find related performance bottlenecks or patterns.
- Use `execute_command` to run profiling tools, build commands (`npm run build`), or performance tests.