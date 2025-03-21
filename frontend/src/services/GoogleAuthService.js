// GoogleAuthService.js - Service for handling Google authentication

// Google OAuth client ID from environment variables
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('Google Client ID not found. Please set REACT_APP_GOOGLE_CLIENT_ID in your environment variables.');
}

// Scopes required for Google Workspace integration
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/contacts.readonly'
];

class GoogleAuthService {
  constructor() {
    this.tokenClient = null;
    this.gsiScriptLoaded = false;
  }

  /**
   * Loads the Google Sign-In script and initializes the client
   */
  async loadGoogleAuthScript() {
    if (this.gsiScriptLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.gsiScriptLoaded = true;
          this.initializeGoogleClient();
          resolve();
        };
        script.onerror = (error) => reject(new Error('Failed to load Google Auth script'));
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initialize Google Client
   */
  initializeGoogleClient() {
    if (!window.google || !window.google.accounts) {
      console.error('Google API not loaded');
      return;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES.join(' '),
      callback: (response) => {
        if (response.error) {
          console.error('Google auth error:', response);
          return;
        }

        // Store the token
        this.handleAuthSuccess(response);
      }
    });
  }

  /**
   * Request Google authentication
   */
  signInWithGoogle() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.gsiScriptLoaded) {
          await this.loadGoogleAuthScript();
        }

        if (!this.tokenClient) {
          this.initializeGoogleClient();
        }

        // Save resolve/reject to call after callback
        this.authPromiseResolver = { resolve, reject };
        
        // Start the Google OAuth flow
        this.tokenClient.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle successful Google authentication
   */
  handleAuthSuccess(response) {
    const token = response.access_token;
    
    // Store the token in localStorage (in a real app, handle with more security)
    localStorage.setItem('googleAccessToken', token);
    
    // Fetch user profile
    this.fetchUserProfile(token)
      .then(userProfile => {
        // Combine token and user profile
        const authData = {
          token,
          userProfile,
          provider: 'google',
          expiresAt: new Date().getTime() + (response.expires_in * 1000)
        };
        
        if (this.authPromiseResolver) {
          this.authPromiseResolver.resolve(authData);
          this.authPromiseResolver = null;
        }
        
        return authData;
      })
      .catch(error => {
        console.error('Error fetching Google user profile:', error);
        if (this.authPromiseResolver) {
          this.authPromiseResolver.reject(error);
          this.authPromiseResolver = null;
        }
      });
  }

  /**
   * Fetch the user's Google profile
   */
  async fetchUserProfile(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Sign out from Google
   */
  signOut() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Clear stored tokens
    localStorage.removeItem('googleAccessToken');
    
    return Promise.resolve();
  }

  /**
   * Check if user is authenticated with Google
   */
  isAuthenticated() {
    const token = localStorage.getItem('googleAccessToken');
    return !!token;
  }
}

// Create and export singleton instance
const googleAuthService = new GoogleAuthService();
export default googleAuthService; 