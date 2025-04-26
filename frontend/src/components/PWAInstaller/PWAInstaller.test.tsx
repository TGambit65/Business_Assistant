import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'; // Use act from @testing-library/react
import '@testing-library/jest-dom';
// Remove deprecated import: import { act } from 'react-dom/test-utils';
import PWAInstaller from './PWAInstaller';

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  prompt: jest.Mock;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;

  constructor(userAccepts = true) {
    super('beforeinstallprompt');
    this.prompt = jest.fn().mockResolvedValue(undefined);
    this.userChoice = Promise.resolve({
      outcome: userAccepts ? 'accepted' : 'dismissed',
      platform: 'web'
    });
  }
}

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock service worker
const mockServiceWorker = () => {
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn().mockResolvedValue({
        update: jest.fn().mockResolvedValue(undefined), // Mock registration object
        waiting: null,
        active: null,
        installing: null,
        scope: '/',
        unregister: jest.fn().mockResolvedValue(true),
        // Add other necessary properties if needed by the component
      }),
      // Ensure getRegistrations returns a non-empty array with a mock registration
      getRegistrations: jest.fn().mockResolvedValue([
        {
          update: jest.fn().mockResolvedValue(undefined),
          waiting: null,
          // Provide basic mock objects instead of null
          active: { state: 'activated', scriptURL: '/sw.js', addEventListener: jest.fn() }, 
          installing: { state: 'installing', scriptURL: '/sw.js', addEventListener: jest.fn() }, 
          scope: '/',
          unregister: jest.fn().mockResolvedValue(true),
        }
      ]),
      ready: Promise.resolve({
        update: jest.fn().mockResolvedValue(undefined)
      })
    },
  });
};

// Mock fetch for manifest
global.fetch = jest.fn().mockImplementation((url) => {
  const urlString = url.toString();
  // Handle both relative and absolute manifest URLs
  if (urlString.endsWith('/manifest.json') || urlString === 'http://localhost/manifest.json') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        name: 'Email Assistant',
        short_name: 'EmailAsst',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
        start_url: '/'
      })
    });
  }
  return Promise.reject(new Error(`Unhandled fetch: ${url}`));
}) as jest.Mock;

// Mock fetch for manifest - Define globally outside describe
global.fetch = jest.fn().mockImplementation((url) => {
  const urlString = url.toString();
  // Handle both relative and absolute manifest URLs
  if (urlString.endsWith('/manifest.json') || urlString === 'http://localhost/manifest.json') {
    console.log(`[Test Debug] Mock fetch returning OK for: ${urlString}`); // Add log
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        name: 'Email Assistant',
        short_name: 'EmailAsst',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
        start_url: '/'
      })
    });
  }
  console.warn(`[Test Warning] Unhandled fetch in mock: ${urlString}`);
  return Promise.reject(new Error(`Unhandled fetch: ${urlString}`));
}) as jest.Mock;

describe('PWAInstaller Component', () => {
  // Move fetch mock setup inside beforeEach
  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceWorker();
    
    // Default: App is not installed
    mockMatchMedia(false);
    
    // Create a manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Clear fetch mock calls, but don't redefine it here
    (global.fetch as jest.Mock).mockClear(); 

    // Mock navigator.permissions
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      value: {
        query: jest.fn().mockResolvedValue({ state: 'granted' }), // Mock query method
      },
    });
  });
  
  afterEach(() => {
    // Clean up manifest link
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      document.head.removeChild(link);
    }
  });

  test('should not render install button when not installable', () => {
    render(<PWAInstaller />);
    
    // No install button should be visible initially
    expect(screen.queryByText(/install app/i)).not.toBeInTheDocument();
  });

  test('should show install button when installable', async () => {
    render(<PWAInstaller />);
    
    // Trigger beforeinstallprompt event inside act
    await act(async () => {
      const event = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });
    
    // Wait specifically for the button to appear
    await screen.findByText(/install app/i); 
  });

  test('should not show install button when already installed', async () => {
    // Mock app is already installed
    mockMatchMedia(true);
    
    render(<PWAInstaller />);
    
    // Trigger beforeinstallprompt event inside act
    await act(async () => {
      const event = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });
    
    // Install button should not be visible
    await waitFor(() => {
      expect(screen.queryByText(/install app/i)).not.toBeInTheDocument();
    });
  });

  test('should trigger installation flow when button is clicked', async () => {
    const onInstallSuccess = jest.fn();
    
    render(<PWAInstaller onInstallSuccess={onInstallSuccess} />);

    // Trigger beforeinstallprompt event inside act
    let event: MockBeforeInstallPromptEvent;
    await act(async () => {
      event = new MockBeforeInstallPromptEvent(true); // User accepts installation
      window.dispatchEvent(event);
    });
    
    // Wait specifically for the button to appear
    const installButton = await screen.findByText(/install app/i);
    
    // Click the install button inside act
    await act(async () => {
      fireEvent.click(installButton);
    });
    
    await waitFor(() => {
      expect(onInstallSuccess).toHaveBeenCalled();
    });
  });

  test('should handle installation rejection', async () => {
    const onInstallFailure = jest.fn();
    
    render(<PWAInstaller onInstallFailure={onInstallFailure} />);

    // Trigger beforeinstallprompt event with user rejection
    let eventRejection: MockBeforeInstallPromptEvent;
    await act(async () => {
      eventRejection = new MockBeforeInstallPromptEvent(false); // User rejects installation
      window.dispatchEvent(eventRejection);
    });
    
    // Wait specifically for the button to appear
    const installButtonRejection = await screen.findByText(/install app/i);
    
    // Click the install button inside act
    await act(async () => {
      fireEvent.click(installButtonRejection);
    });
    
    await waitFor(() => {
      // onInstallFailure should not be called for user rejection (it's not an error)
      expect(onInstallFailure).not.toHaveBeenCalled();
    });
  });

  test('should handle custom children as install button', async () => {
    render(
      <PWAInstaller>
        <button>Custom Install Button</button>
      </PWAInstaller>
    );
    
    // Trigger beforeinstallprompt event
    let eventCustom: MockBeforeInstallPromptEvent;
    await act(async () => {
      eventCustom = new MockBeforeInstallPromptEvent();
      window.dispatchEvent(eventCustom);
    });
    
    // Custom button should be rendered
    const customButton = await screen.findByText(/custom install button/i); // Wait for button
    expect(customButton).toBeInTheDocument();
    
    // Click the custom button
    await act(async () => {
      fireEvent.click(customButton);
    });
    
    await waitFor(() => {
      expect(eventCustom.prompt).toHaveBeenCalled();
    });
  });
});
