/**
 * This file provides TinyMCE utility functions
 * Since TinyMCE is loaded via index.html, we can simplify this
 */

// Function to check if TinyMCE is loaded
export const preloadTinyMCE = () => {
  if (window.tinymce) {
    console.log('TinyMCE already loaded');
    return Promise.resolve();
  }

  // We're not loading it dynamically anymore since it's in index.html
  // Just return a promise that resolves once TinyMCE exists on window
  return new Promise((resolve) => {
    // Check for TinyMCE every 100ms
    const checkInterval = setInterval(() => {
      if (window.tinymce) {
        clearInterval(checkInterval);
        console.log('TinyMCE found in global scope');
        resolve();
      }
    }, 100);

    // Set a timeout in case TinyMCE never loads
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('TinyMCE not found after 10 seconds');
      resolve(); // Resolve anyway to not block the app
    }, 10000);
  });
};

// Export a configured TinyMCE init
export const getDefaultTinyMCEConfig = (height = 300, menubar = false) => ({
  height,
  menubar,
  // Add GPL license key to avoid evaluation mode warnings
  license_key: 'gpl',
  // Disable cloud usage
  cloud_upload_settings: false,
  // Specify paths explicitly
  suffix: '.min',
  base_url: '/tinymce',
  // Specify skin that we know exists
  skin: 'oxide',
  skin_url: '/tinymce/skins/ui/oxide',
  content_css: '/tinymce/skins/content/default/content.min.css',
  // Configure external plugins
  external_plugins: {
    'robust_spellchecker': '/tinymce-plugins/robust_spellchecker.js'
  },
  // Plugin configuration - include robust_spellchecker
  plugins: 'autolink link lists robust_spellchecker',
  // Dictionary settings for the spellchecker
  spellchecker_dictionary_encoding: 'ISO8859-1',
  // Add custom CSS for misspelled words
  content_style: `
    .mce-misspelled-word {
      text-decoration: wavy underline red;
      cursor: pointer;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.4;
      margin: 1rem;
    }
  `,
  // Enable debug mode to see detailed errors
  debug: false,
  setup: function(editor) {
    editor.on('init', function() {
      console.log('Editor initialized:', editor.id);
    });
    editor.on('Error', function(e) {
      console.error('TinyMCE Error:', e);
    });
  },
  // Toolbar updated to include robust_spellchecker button
  toolbar:
    "undo redo | formatselect | bold italic | " +
    "alignleft aligncenter alignright | " +
    "bullist numlist | removeformat | robust_spellchecker"
});
