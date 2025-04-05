# CONTEXT TRANSFER PROTOCOL
Version: 1.0

YOU MUST IMMEDIATELY:

1. ANALYZE CURRENT CHAT
   - Scan ALL previous prompts
   - Extract ALL pending tasks
   - Identify ALL active code changes
   - Capture ALL technical decisions

2. GENERATE AIF DOCUMENT
   ```json
   {
     "metadata": {
       "contextFingerprint": "[HASH]",
       "taskProgress": "PERCENTAGE",
       "activeMode": "CURRENT_RIPER_MODE",
       "timestamp": "ISO_TIMESTAMP"
     },
     "context": {
       "activeTasks": [],
       "pendingChanges": [],
       "technicalDecisions": [],
       "codeState": {
         "modifiedFiles": [],
         "newFiles": [],
         "deletedFiles": []
       }
     },
     "continuationState": {
       "nextActions": [],
       "blockers": [],
       "remainingWork": "",
       "validationStatus": {}
     }
   }
   ```

3. VERIFY COMPLETENESS
   - ALL task requirements captured
   - ALL code changes documented
   - ALL decisions preserved
   - ALL error states recorded

4. FORMAT OUTPUT
   YOU MUST present the AIF as:
   ```
   === BEGIN CONTEXT TRANSFER ===
   [AIF JSON document]
   === END CONTEXT TRANSFER ===
   ```

EXECUTE TRANSFER PROTOCOL NOW.