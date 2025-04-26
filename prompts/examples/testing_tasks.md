# Testing Tasks

This prompt is optimized for creating and maintaining tests in this project:

```
I need help with test creation or maintenance for this project.

## Project Context
- Frontend: React with TypeScript, using React Hooks and Context API
- Backend: Express.js with TypeScript
- Testing: Jest and React Testing Library
- Test Setup: frontend/src/tests/setup.ts and src/tests/setup.ts
- Mocks: frontend/src/tests/__mocks__/ and src/tests/mocks/

## Task Complexity
This is a [moderate/complex] task - please adjust your context threshold accordingly (55-65%/65-75%).

## Testing Best Practices
1. React Component Testing:
   - ALWAYS wrap component renders in act(): `act(() => { render(<Component />) })`
   - ALWAYS wrap events that cause state changes in act(): `act(() => { fireEvent.click(button) })`
   - Use waitFor() for async assertions: `await waitFor(() => expect(element).toBeInTheDocument())`
   - Mock all external dependencies and services
   - Test both success and error states

2. API/Service Testing:
   - Mock external service calls and databases
   - Test error handling and edge cases
   - Use beforeEach to reset mocks between tests
   - Verify service method calls with correct parameters

## Test Structure
- Describe: Group related tests
- Test/It: Test a specific behavior
- Setup → Action → Assertion pattern
- Mock reset between tests

## Tool Usage Preferences
1. Read existing test files for similar components to understand patterns
2. Check the component implementation to understand what needs testing
3. Use search_files to find existing mock patterns
4. Leverage the test utilities in test-utils.ts

## My testing task is:
[Describe your testing task: component to test, functionality to cover, or test issues to fix]
```

## How to use this prompt:
1. Copy the entire block between the triple backticks
2. Choose moderate/complex based on the testing complexity
3. Replace the testing task description with your specific needs
4. Send to Roo Code at the beginning of your conversation

## Common React Testing Issues:
- Missing act() wrappers cause "Warning: An update to X inside a test was not wrapped in act(...)"
- Async timing problems need waitFor() or act(async () => {})
- Test cleanup between tests prevents state leakage
- Proper mocking of Context providers, Redux store, or other providers