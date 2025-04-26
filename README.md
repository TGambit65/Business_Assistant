# Business Assistant

A modern, responsive business assistant application built with React and Tailwind CSS. This app helps users manage their emails, create business documents, and organize their work more efficiently with AI-powered features.

## Features

- **AI-Powered Drafting**: Generate professional emails and business documents tailored to your needs
- **Smart Templates**: Access a library of customizable templates for various communication purposes
- **Advanced Organization**: Categorize and prioritize your emails with intelligent filters
- **Document Generation**: Create business documents, proposals, and more with customized industry-specific templates
- **Rich Text Editing**: Format your content with a powerful built-in editor
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Multiple Languages**: Support for multilingual communication
- **Mobile Responsive**: Access your business assistant from any device

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`

## Usage

Sign in with your account credentials to access the full functionality of the Business Assistant.

### Email Management

- View and organize your inbox
- Sort emails by priority, category, or date
- Apply labels for better organization

### AI Features

- Generate email drafts with the AI assistant
- Get content suggestions while composing
- Create industry-specific business documents

### Settings

- Customize your experience through the settings page
- Set up email signatures
- Configure notification preferences

## Technology Stack

- **Frontend**: React, Tailwind CSS, React Router
- **State Management**: React Context API
- **Charts**: Recharts for visualizations
- **Authentication**: JWT-based authentication
- **Styling**: Custom UI components built with Tailwind

## Project Structure

```
email-assistant/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Layout components
│   │   │   └── ui/           # UI components (buttons, cards, etc.)
│   │   ├── contexts/         # React Context providers
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   └── settings/     # Settings pages
│   │   ├── lib/              # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   └── index.js          # Application entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
└── README.md                 # Project documentation
```

## Roadmap

- Email scheduling functionality
- AI-powered email response suggestions
- Integration with popular email services
- Mobile app versions for iOS and Android

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The project uses [React](https://reactjs.org/) for the frontend UI
- Styling is done with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide](https://lucide.dev/)
- Charts built with [Recharts](https://recharts.org/)

## SpellChecker Service

The SpellChecker Service provides robust spell checking functionality with dictionary management, caching, and multi-language support.

### Features

- Dictionary loading with retry mechanism
- LRU caching for improved performance
- Memory-efficient dictionary storage using Set
- Fallback spellchecking mechanism
- Multi-language support
- Word suggestions based on Levenshtein distance
- Comprehensive error handling

### Usage

```typescript
import { SpellCheckerService } from './src/spellchecker';

// Create and initialize SpellChecker
const spellChecker = new SpellCheckerService();
await spellChecker.initialize();

// Check spelling of a word
const isCorrect = await spellChecker.check('hello');

// Get suggestions for misspelled words
const suggestions = await spellChecker.suggest('helo');

// For more details see src/spellchecker/README.md
```

### Running the Demo

```bash
# Compile TypeScript
npm run build

# Run the demo
node dist/demo.js
```

# Email Assistant Application - Resource Optimization

This document outlines the optimizations implemented to address the `ERR_INSUFFICIENT_RESOURCES` error that was occurring in the application.

## Overview of the Problem

The application was encountering resource exhaustion errors, particularly:
- `Failed to load resource: net::ERR_INSUFFICIENT_RESOURCES` for favicon.ico
- Excessive connection checks in useOnlineStatus.js
- Potential infinite render loops
- Navigation failures after login due to resource constraints

## Implemented Solutions

### 1. Optimized Online Status Checking

- Improved the `useOnlineStatus` hook to use a lightweight `/health-check.txt` file instead of multiple requests to `/api/health-check`
- Added proper request throttling and caching
- Implemented AbortController to prevent hanging requests
- Added connection quality detection

### 2. Favicon Loading Optimization

- Created a dedicated `FaviconLoader` component to handle favicon loading
- Added preloading and caching directives
- Added proper crossorigin attributes
- Prevented multiple favicon requests with a global flag

### 3. Resource Monitoring System

- Implemented a comprehensive resource monitoring system in `resourceMonitor.js`
- Added automatic detection of memory usage patterns
- Created a system to detect excessive HTTP requests
- Added resource conservation measures when constraints are detected

### 4. Resource-Constrained CSS Mode

- Created `resource-optimization.css` with styles for resource-constrained mode
- Disabled animations and transitions when resources are limited
- Reduced layout calculations and repaints
- Simplified visual effects to reduce GPU/CPU usage

### 5. Network Request Interceptor

- Implemented a network interceptor in `networkInterceptor.js`
- Added request throttling to prevent flooding
- Prioritized critical endpoints and delayed non-essential requests
- Added duplicate request detection and prevention

### 6. Debug and Diagnosis Tools

- Added debug tools in `debugTools.js` for troubleshooting resource issues
- Implemented frame rate monitoring
- Created memory usage tracking
- Added network request history logging
- Setup console debugging capabilities

### 7. Robust Login Navigation

- Enhanced login navigation with multiple fallback approaches
- Added proper error handling and logging
- Implemented delays to allow the browser to process state changes
- Reduced the number of success toasts to conserve resources

### 8. Render Loop Prevention

- Created `renderGuard.js` to detect and prevent infinite render loops
- Added component render counting and threshold enforcement
- Applied automatic resource-constrained mode when loops are detected
- Implemented periodic cleanup to prevent memory leaks

### 9. Resource Safe Component

- Created `ResourceSafeComponent.jsx` wrapper for high-risk components
- Provided Higher-Order Component (HOC) for easier integration
- Added memory leak detection for long-lived components
- Implemented component-level error boundary functionality

## How to Use the Resource Management Tools

### Debug Console

When in development mode, you can access debugging tools through the browser console:

```javascript
// Log current resource information
debug.logResourceInfo();

// Force resource-constrained mode for testing
debug.forceLowResourceMode();

// Exit resource-constrained mode
debug.exitLowResourceMode();

// View recent network requests
debug.getRequestHistory();
```

### Monitoring Resource Usage

The application now automatically monitors resource usage and applies optimizations when needed:

1. When memory usage exceeds thresholds, it enters resource-constrained mode
2. When many concurrent network requests are detected, it throttles non-essential requests
3. When frame rate drops below acceptable levels, it reduces animations

### Preventing Render Loops

To protect components from infinite render loops:

```jsx
// Using the HOC approach
import { withResourceSafety } from './components/common/ResourceSafeComponent';

// Wrap your component
const SafeComponent = withResourceSafety({ 
  name: 'MyComponent' 
})(MyComponent);

// Or use the hook directly in functional components
import { useRenderGuard } from './utils/renderGuard';

function MyComponent() {
  // This will track renders and break loops if needed
  useRenderGuard('MyComponent');
  
  // Rest of your component
  return (/* ... */);
}
```

### Using the Resource Safe Component Wrapper

For components that might be resource-intensive:

```jsx
import ResourceSafeComponent from './components/common/ResourceSafeComponent';

// In your JSX
<ResourceSafeComponent
  component={ExpensiveComponent}
  componentProps={{ data: myData }}
  name="ExpensiveComponent"
  fallback={<div>Loading alternative...</div>}
/>
```

## Further Improvement Areas

1. Implement server-side request throttling and rate limiting
2. Add more granular resource usage metrics
3. Implement progressive loading for large datasets
4. Add more extensive browser compatibility testing
5. Incorporate automated resource usage testing in CI/CD pipeline
6. Develop machine learning based prediction of resource constraints
7. Create an administration dashboard for resource monitoring
8. Implement Web Workers for computationally intensive tasks
9. Add adaptive quality settings based on detected device capabilities
10. Consider server-side rendering for resource-constrained devices

## Testing the Optimizations

To verify the optimizations:

1. Open the application and log in
2. Open browser devtools and observe network requests
3. Check for any ERR_INSUFFICIENT_RESOURCES errors
4. Verify that the application remains responsive even under load 