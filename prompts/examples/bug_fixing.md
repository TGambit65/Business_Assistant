# Bug Fixing Tasks

This prompt is optimized for debugging and fixing issues in this project:

```
I need help debugging an issue in this project.

## Project Context
- Frontend: React with TypeScript, using React Hooks and Context API
- Backend: Express.js with TypeScript
- Testing: Jest and React Testing Library
- State Management: Context API and custom hooks
- UI Framework: Tailwind CSS
- Authentication: JWT-based auth
- APIs: RESTful API patterns

## Task Complexity
This is a [moderate/complex] task - please adjust your context threshold accordingly (55-65%/65-75%).

## Debugging Approach
1. First, let's understand the bug symptoms
2. Identify which component/service is likely involved 
3. Check for common issue patterns:
   - React: useEffect dependencies, state timing issues, render cycles
   - TypeScript: Type mismatches, null/undefined handling
   - API: Error handling, async/await patterns, response processing
   - Testing: act() wrapping, async timing, mock implementations

## Key Directories
- Frontend components: frontend/src/components/
- Backend services: src/services/
- API routes: src/routes/
- Tests: frontend/src/tests/ and src/tests/
- Types: frontend/src/types/ and src/types/

## Tool Usage Preferences
1. Use search_files to find error patterns before reading entire files
2. Use apply_diff for targeted fixes
3. Verify fixes with test runs
4. Search for similar patterns elsewhere that might have the same issue

## Bug description:
[Describe the bug here: what happens, expected behavior, error messages, steps to reproduce]
```

## How to use this prompt:
1. Copy the entire block between the triple backticks
2. Choose moderate/complex based on the debugging complexity
3. Replace the bug description with your specific issue
4. Include any error messages or stack traces if available
5. Send to Roo Code at the beginning of your conversation