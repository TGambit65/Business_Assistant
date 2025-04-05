# DraftGenerator Component

The DraftGenerator component provides a user interface for generating email drafts using AI assistance. It integrates with the AIDraftGenerator service and supports offline functionality.

## Features

- Real-time draft generation using AI
- Mobile-responsive design
- Offline support with sync queue
- Error handling and boundary protection
- Customizable tone and context

## Props

| Prop | Type | Description |
|------|------|-------------|
| initialContext | DraftContext | Initial context for the draft generator |
| onDraftGenerated | (draft: Draft) => void | Callback when a draft is generated |
| onError | (error: Error) => void | Callback when an error occurs |

## Usage

```tsx
import { DraftGenerator } from './components/draft/DraftGenerator';

function EmailComposer() {
  const handleDraftGenerated = (draft) => {
    console.log('New draft:', draft);
  };

  const handleError = (error) => {
    console.error('Generation error:', error);
  };

  return (
    <DraftGenerator
      initialContext={{
        purpose: 'Meeting follow-up',
        tone: 'professional'
      }}
      onDraftGenerated={handleDraftGenerated}
      onError={handleError}
    />
  );
}
```

## Implementation Details

The component uses several hooks and services:

- useMediaQuery: For responsive design
- useOffline: For offline functionality
- AIDraftGenerator: For AI-powered draft generation
- ErrorBoundary: For error handling

## Styling

The component uses Tailwind CSS for styling and is designed to be mobile-first. The layout adjusts based on screen size and provides appropriate spacing and typography.

## Error Handling

Errors are handled at multiple levels:
1. Component-level try/catch
2. Error boundary wrapper
3. Error callback prop

## Offline Support

When offline:
1. Draft requests are queued
2. UI indicates offline status
3. Queued items sync when online 