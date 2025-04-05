/**
 * Global TypeScript declarations
 */

// Google OAuth interface
interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: any) => void;
  }) => {
    requestAccessToken: (options?: {
      code_challenge?: string;
      code_challenge_method?: string;
    }) => void;
  };
}

interface GoogleAccounts {
  id?: {
    initialize: (config: any) => void;
    renderButton: (element: HTMLElement, options: any) => void;
    disableAutoSelect: () => void;
    prompt: (callback?: () => void) => void;
  };
  oauth2: GoogleAccountsOAuth2;
}

interface Google {
  accounts: GoogleAccounts;
}

// Extend Window interface to include Google
interface Window {
  google?: Google;
}

// Other global declarations can be added here as needed 