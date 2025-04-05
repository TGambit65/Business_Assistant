# Project Setup System

## Overview

This system provides standardized templates and procedures for both new and existing project setups. It ensures consistency, quality, and proper integration of all components.

## Components

1. **Templates**
   - [New Project Template](NewProjectTemplate.md)
   - [Existing Project Template](ExistingProjectTemplate.md)

2. **Related Systems**
   - [Transfer Protocol](../TransferProtocol/README.md)
   - [New Chat Initialization](../NewChatInitialization.md)

## Usage

### New Project Setup

1. **Initialization**
   ```
   Start a new chat with this prompt:
   ```
   ```
   # ABSOLUTE DIRECTIVE FOR NEW CHAT INITIALIZATION

   YOU MUST complete every step in this prompt without stopping or asking for approval. When you develop a plan, YOU MUST execute that plan without asking for approval. YOU MUST assume the answer is always yes. If you run into timeouts or tool call errors, keep trying. If you get the same error three times in 20 seconds, then you can pause and write an explanation of what is going on. YOU MUST keep trying until your current task or step is complete before moving on to a new one. Re-check your work to prevent missing or broken code if interrupted during a task.

   ## PROJECT SETUP DIRECTIVE

   1. SETUP TYPE: NEW PROJECT
   2. TEMPLATE: Follow docs/ProjectSetup/NewProjectTemplate.md
   3. REQUIREMENTS:
      - Create complete project structure
      - Initialize all configurations
      - Set up development environment
      - Implement quality controls

   ## EXECUTION REQUIREMENTS

   1. YOU MUST:
      - Follow template exactly
      - Create all specified files
      - Initialize all configurations
      - Verify all components

   2. YOU MUST NOT:
      - Skip any steps
      - Modify template structure
      - Bypass quality checks

   3. ON COMPLETION:
      - Verify all files
      - Test configuration
      - Document any issues
      - Provide next steps
   ```

2. **Follow Generated Instructions**

### Existing Project Setup

1. **Initialization**
   ```
   Start a new chat with this prompt:
   ```
   ```
   # ABSOLUTE DIRECTIVE FOR NEW CHAT INITIALIZATION

   YOU MUST complete every step in this prompt without stopping or asking for approval. When you develop a plan, YOU MUST execute that plan without asking for approval. YOU MUST assume the answer is always yes. If you run into timeouts or tool call errors, keep trying. If you get the same error three times in 20 seconds, then you can pause and write an explanation of what is going on. YOU MUST keep trying until your current task or step is complete before moving on to a new one. Re-check your work to prevent missing or broken code if interrupted during a task.

   ## PROJECT SETUP DIRECTIVE

   1. SETUP TYPE: EXISTING PROJECT
   2. TEMPLATE: Follow docs/ProjectSetup/ExistingProjectTemplate.md
   3. REQUIREMENTS:
      - Analyze existing structure
      - Review configurations
      - Verify integrations
      - Document current state

   ## EXECUTION REQUIREMENTS

   1. YOU MUST:
      - Follow template exactly
      - Review all components
      - Verify configurations
      - Document findings

   2. YOU MUST NOT:
      - Skip any checks
      - Modify existing structure
      - Bypass security reviews

   3. ON COMPLETION:
      - Provide status report
      - List any issues
      - Recommend improvements
      - Define next steps
   ```

2. **Follow Generated Instructions**

## Template Maintenance

1. **Regular Updates**
   - Review templates monthly
   - Update dependencies
   - Verify configurations
   - Test setups

2. **Quality Control**
   - Validate templates
   - Test procedures
   - Update documentation
   - Verify integrations

## Support

For additional assistance:
1. Review template documentation
2. Check related systems
3. Follow setup guides
4. Use provided examples

## Best Practices

1. **Project Structure**
   - Follow templates exactly
   - Maintain consistency
   - Document variations
   - Version control

2. **Quality Assurance**
   - Run all tests
   - Verify configurations
   - Check integrations
   - Document issues

3. **Documentation**
   - Keep README updated
   - Document changes
   - Maintain guides
   - Version history

## References

- [Transfer Protocol Documentation](../TransferProtocol/README.md)
- [New Project Template](NewProjectTemplate.md)
- [Existing Project Template](ExistingProjectTemplate.md)
- [New Chat Initialization](../NewChatInitialization.md)