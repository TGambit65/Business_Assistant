# Feature Development Tasks

This prompt is optimized for implementing new features in this project:

```
I need help implementing a new feature in this project.

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

## Feature Development Approach
1. First, let's understand the requirements and user experience
2. Design the solution architecture (components, services, data flow)
3. Identify existing patterns to follow for consistency
4. Implement the feature in small, testable increments
5. Add tests for the new functionality
6. Document any architectural decisions or usage notes

## Key Directories
- Frontend components: frontend/src/components/
- Backend services: src/services/
- API routes: src/routes/
- Tests: frontend/src/tests/ and src/tests/
- Types: frontend/src/types/ and src/types/

## Tool Usage Preferences
1. Use list_files to understand the project structure
2. Use search_files to find similar patterns before implementation
3. Use list_code_definition_names to identify useful functions/components
4. Create TypeScript interfaces for new data structures
5. Follow existing coding patterns (naming, structure, architecture)
6. Add test coverage for new functionality

## Feature Description:
[Describe the feature here: user stories, requirements, acceptance criteria, any design mockups or UI/UX considerations]
```

## How to use this prompt:
1. Copy the entire block between the triple backticks
2. Choose moderate/complex based on the feature scope
3. Replace the feature description with your specific needs
4. Include user stories, requirements, and any design mockups
5. Send to Roo Code at the beginning of your conversation