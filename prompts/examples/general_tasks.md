# General Development Tasks

This prompt is optimized for general development tasks in this project's tech stack:

```
I need help with a general development task in this project.

## Project Context
- Frontend: React with TypeScript, using React Hooks and Context API
- Backend: Express.js with TypeScript
- Testing: Jest and React Testing Library
- State Management: Context API and custom hooks
- UI Framework: Tailwind CSS
- Authentication: JWT-based auth
- APIs: RESTful API patterns

## Task Complexity
This is a [simple/moderate/complex] task - please adjust your context threshold accordingly (40-50%/55-65%/65-75%).

## Key Directories
- Frontend components: frontend/src/components/
- Backend services: src/services/
- API routes: src/routes/
- Tests: frontend/src/tests/ and src/tests/
- Types: frontend/src/types/ and src/types/

## Tool Usage Preferences
1. Use list_files/search_files before reading entire files
2. Prefer apply_diff for targeted changes over write_to_file
3. Use React.useEffect dependencies correctly
4. Wrap React test state updates in act()
5. Maintain TypeScript type safety

## My specific task is:
[Describe your task here]
```

## How to use this prompt:
1. Copy the entire block between the triple backticks
2. Choose simple/moderate/complex based on your task scope
3. Replace the task description with your specific need
4. Send to Roo Code at the beginning of your conversation