// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  // First check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    if (config && config.onError) {
      config.onError(new Error('Service workers not supported'));
    }
    return;
  }

  if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_SW === 'true') {
    // The URL constructor is available in all browsers that support SW.
    try {
      const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // Our service worker won't work if PUBLIC_URL is on a different origin
        // from what our page is served on. This might happen if a CDN is used to
        // serve assets; see https://github.com/facebook/create-react-app/issues/2374
        console.warn('Service worker cannot be registered due to PUBLIC_URL origin mismatch');
        if (config && config.onError) {
          config.onError(new Error('PUBLIC_URL origin mismatch'));
        }
        return;
      }
    } catch (e) {
      // If URL constructor fails (e.g., in JSDOM test environment with invalid base URL),
      // log a warning and proceed, skipping the origin check for tests.
      if (e instanceof TypeError && e.message.includes('Invalid URL')) {
         console.warn('Skipping PUBLIC_URL origin check due to invalid window.location.href in current environment (likely test).');
      } else {
         // Re-throw unexpected errors
         throw e;
      }
    }

    window.addEventListener('load', () => {
      try {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

        if (isLocalhost) {
          // This is running on localhost. Let's check if a service worker still exists or not.
          checkValidServiceWorker(swUrl, config);

          // Add some additional logging to localhost, pointing developers to the
          // service worker/PWA documentation.
          navigator.serviceWorker.ready
            .then(() => {
              console.log(
                'This web app is being served cache-first by a service ' +
                  'worker. To learn more, visit https://cra.link/PWA'
              );
            })
            .catch(error => {
              console.error('Service worker ready promise rejected:', error);
            });
        } else {
          // Is not localhost. Just register service worker
          registerValidSW(swUrl, config);
        }
      } catch (error) {
        console.error('Error in service worker registration setup:', error);
        if (config && config.onError) {
          config.onError(error);
        }
      }
    });

    // Add listener for app coming back online to refresh content
    window.addEventListener('online', () => {
      if (navigator.serviceWorker.controller) {
        try {
          navigator.serviceWorker.controller.postMessage({
            type: 'REFRESH_CONTENT'
          });
        } catch (error) {
          console.error('Error sending refresh message to service worker:', error);
        }
      }
    });
    
    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      try {
        // Handle different message types
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case 'CACHE_UPDATED':
              console.log('Service worker has updated cache:', event.data.url);
              break;
            case 'OFFLINE_READY':
              console.log('Application is ready for offline use');
              break;
            case 'SW_ERROR':
              console.error('Service worker reported an error:', event.data.error);
              break;
            default:
              console.log('Service worker message:', event.data);
          }
        }
      } catch (error) {
        console.error('Error handling service worker message:', error);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      // Create a global reference to the registration
      window.swRegistration = registration;
      
      // Set up error handling for the service worker
      if (registration.installing) {
        registration.installing.addEventListener('error', (event) => {
          console.error('Service worker installation error:', event);
          if (config && config.onError) {
            config.onError(new Error('Service worker installation failed'));
          }
        });
      }
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          } else if (installingWorker.state === 'redundant') {
            console.error('The installing service worker became redundant');
            if (config && config.onError) {
              config.onError(new Error('Service worker became redundant during installation'));
            }
          }
        };
      };
      
      // Actively check for updates periodically with error handling
      const updateInterval = setInterval(() => {
        try {
          registration.update()
            .catch(error => {
              console.error('Error updating service worker:', error);
            });
        } catch (error) {
          console.error('Error during service worker update check:', error);
          // Stop trying to update if we consistently fail
          if (error.name === 'InvalidStateError') {
            console.warn('Stopping automatic service worker updates due to invalid state');
            clearInterval(updateInterval);
          }
        }
      }, 60 * 60 * 1000); // Check every hour
      
      // Store the interval ID to clear it if needed
      window.swUpdateInterval = updateInterval;
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
      
      // Attempt to recover if possible
      if (error.name === 'SecurityError') {
        console.warn('Service worker registration failed due to security restrictions');
      } else if (error.name === 'TypeError') {
        console.warn('Service worker file may not be accessible');
      } else {
        console.warn('Unknown service worker registration error');
      }
      
      if (config && config.onError) {
        config.onError(error);
      }
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready
          .then(registration => {
            return registration.unregister();
          })
          .then(() => {
            console.log('No valid service worker found, reloading application');
            window.location.reload();
          })
          .catch(error => {
            console.error('Error unregistering service worker:', error);
          });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(error => {
      console.log(
        'No internet connection found or error checking service worker. App is running in offline mode.',
        error
      );
      // Even if offline, try to register the service worker
      // This allows the app to work offline on subsequent visits
      try {
        registerValidSW(swUrl, config);
      } catch (registrationError) {
        console.error('Failed to register service worker in offline mode:', registrationError);
        if (config && config.onError) {
          config.onError(registrationError);
        }
      }
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // Clear the update interval if it exists
        if (window.swUpdateInterval) {
          clearInterval(window.swUpdateInterval);
          window.swUpdateInterval = null;
        }
        
        return registration.unregister();
      })
      .then(() => {
        console.log('Service worker successfully unregistered');
        // Clear the registration reference
        window.swRegistration = null;
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
} 