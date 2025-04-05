# EMAIL ASSISTANT PROJECT: CURSOR RULE

This project-specific rule enhances the RIPER-5 protocol with guidance tailored to this email assistant application's architecture and patterns.

## TECH STACK CONTEXT
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Radix UI components
- **Rich Text Editing**: TinyMCE, Draft.js
- **State Management**: React Context API, custom hooks
- **Routing**: React Router
- **Testing**: Jest, React Testing Library
- **Security**: Custom encryption (AnalyticsEncryption), KeyVault pattern
- **Data Visualization**: Recharts
- **Backend**: Node.js with TypeScript
- **API Communication**: Axios
- **Validation**: Zod
- **Authentication**: Next-auth

## PROJECT ARCHITECTURE

### Key Directories and Files
- **Frontend Components**: `frontend/src/components/`
- **Backend Services**: `src/services/` and `src/spellchecker/`
- **Type Definitions**: `src/types/`, `frontend/src/types/`
- **Security Modules**: `frontend/src/security/`
- **Test Files**: `frontend/src/tests/`, `src/spellchecker/tests/`
- **Mock Data**: `frontend/src/tests/__mocks__/`

### Critical Patterns to Preserve
- **Security First**: All sensitive data must be properly encrypted/decrypted
- **TypeScript Type Safety**: Maintain strict typing across components
- **Test Coverage**: All components require test coverage with proper act() usage
- **PWA Support**: Maintain progressive web app capabilities
- **Modular Structure**: Keep services and components properly separated

## MODE-SPECIFIC GUIDANCE

### [MODE: RESEARCH] Guidance
- **Security Assessment**: Pay special attention to `frontend/src/security/` and related usage
- **Component Analysis**: Understand component relationships in `frontend/src/components/`
- **Service Dependencies**: Map relationships between services in `src/services/`
- **Test Pattern Review**: Examine test patterns in `frontend/src/tests/` before modifications

### [MODE: INNOVATE] Guidance
- **Security Compatibility**: All proposals must maintain the encryption patterns
- **PWA Considerations**: Changes must work in both online and offline modes
- **TypeScript Strictness**: Solutions must maintain type safety
- **Testing Approach**: Include testing strategy for React components with proper act() usage
- **Performance Impact**: Consider impact of changes on analytics and responsiveness

### [MODE: PLAN] Guidance
- **Required File Updates**: List all files needing modification
- **Type Definition Changes**: Include updates to type definitions
- **Testing Strategy**: Detail test approach for React components
- **Security Implications**: Document any changes to security model
- **Spell Checking Integration**: Consider impact on spell checking functionality

### [MODE: EXECUTE] Guidance
- **React Component Updates**: Always wrap state updates in act() in tests
- **Security Rules**:
  - Never expose sensitive keys
  - Use existing encryption patterns
  - Maintain proper validation
- **TypeScript Precision**: Avoid any/unknown types unless absolutely necessary
- **Test Implementation**: Follow the established testing patterns

### [MODE: REVIEW] Guidance
- **Security Verification**: Verify encryption is properly maintained
- **Type Safety Check**: Ensure type safety is preserved
- **Test Coverage**: Confirm test coverage for changed components
- **Performance Impact**: Assess any performance implications
- **Code Style Consistency**: Verify adherence to existing patterns

## COMMON ISSUES TO AVOID
1. **React Testing Mistakes**: Missing act() wrappers for state updates
2. **TypeScript Type Erosion**: Introducing any/unknown types
3. **Security Weaknesses**: Exposing sensitive data or keys
4. **Component Coupling**: Creating tight coupling between components
5. **Untested Code**: Adding features without corresponding tests

## REANALYSIS TRIGGER
Use this command when project architecture changes significantly:
```
Analyze the current state of the email assistant project and update the project-specific rule to reflect architectural changes, new patterns, or technology additions.