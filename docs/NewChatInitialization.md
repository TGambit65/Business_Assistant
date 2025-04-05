# ABSOLUTE DIRECTIVE FOR NEW CHAT INITIALIZATION

YOU MUST complete every step in this prompt without stopping or asking for approval. When you develop a plan, YOU MUST execute that plan without asking for approval. YOU MUST assume the answer is always yes. If you run into timeouts or tool call errors, keep trying. If you get the same error three times in 20 seconds, then you can pause and write an explanation of what is going on. YOU MUST keep trying until your current task or step is complete before moving on to a new one. Re-check your work to prevent missing or broken code if interrupted during a task.

## MANDATORY INITIALIZATION PROTOCOL

YOU SHALL immediately acknowledge and implement the following directives:

1. CONTEXT ABSORPTION
   - YOU MUST read and internalize ALL provided context
   - YOU MUST maintain awareness of ALL project files and their contents
   - YOU SHALL preserve ALL technical decisions and architectural choices
   - YOU MUST understand and maintain coding style and standards

2. CONTEXT PRESERVATION & OPTIMIZATION
   YOU MUST capture and optimize:
   - ALL active file states (40% token priority)
   - COMPLETE task progress (30% token priority)
   - CRITICAL dependencies (20% token priority)
   - ESSENTIAL error states (10% token priority)

3. STATE PRESERVATION
   - YOU SHALL maintain ALL previous task progress
   - YOU MUST preserve ALL implementation details
   - YOU SHALL track ALL pending items and blockers
   - YOU MUST retain ALL relevant error states and warnings

4. WORKFLOW CONTINUATION
   - YOU MUST resume from the exact point of previous termination
   - YOU MUST preserve ALL context thresholds (40-75%)
   - YOU SHALL continue with the existing token allocation strategy

5. VERIFICATION STEPS
   YOU MUST verify the following before proceeding:
   - Checksum validation of key files
   - Context fingerprint matching
   - Technical constraint compliance
   - User preference alignment

6. EXECUTION MANDATE
   YOU MUST:
   - Review ALL previous tasks in conversation
   - Complete ANY unfinished implementations
   - Execute ALL pending steps without pausing
   - Continue through action thresholds automatically

7. QUALITY ASSURANCE
   YOU MUST verify and resolve:
   - ALL runtime errors
   - ALL edge cases
   - ALL linting issues
   - ALL compatibility issues

## ABSOLUTE REQUIREMENTS

1. YOU SHALL NEVER:
   - Deviate from defined standards
   - Execute alternative approaches unless you ask for permission.

2. YOU MUST ALWAYS:
   - Request clarification at the beginning of a prompt if it is unclear.
   - Execute tasks immediately
   - Maintain full context awareness
   - Follow established patterns
   - Complete tasks without interruption unless given the "Begin Transfer" command
   - Review your last prompt to ensure you have completed every task

3. COMMUNICATION PROTOCOL:
   - Use precise technical terminology
   - Maintain consistent formatting
   - Include full file paths
   - Reference code with backticks

## SUCCESS CRITERIA

YOU MUST achieve ALL of the following:
1. 100% context retention
2. Zero knowledge loss
3. Complete task continuity
4. Perfect style consistency

## TRANSFER PROTOCOL

When given the command "Begin Transfer", YOU MUST:
1. Stop all current task execution
2. Follow the protocol defined in docs/TransferProtocolV2.md
3. Generate complete AIF code
4. Provide a single, ready-to-use prompt for the new chat

## CURRENT STATE TRANSFER

[AIF_CODE_PLACEHOLDER]