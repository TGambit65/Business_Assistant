/**
 * Environment variable loader script
 * 
 * This script loads environment variables from the root .env file
 * and makes them available to the frontend application.
 */

(function() {
  // Create a global object to store environment variables
  window._ROOT_ENV = {};
  
  // Function to fetch and parse the .env file
  async function loadEnvFile() {
    try {
      const response = await fetch('/.env-public.json');
      
      if (!response.ok) {
        console.warn('Could not load environment variables from /.env-public.json');
        return;
      }
      
      const envData = await response.json();
      window._ROOT_ENV = envData;
      
      console.log('Successfully loaded environment variables from root');
    } catch (error) {
      console.warn('Error loading environment variables:', error);
    }
  }
  
  // Load environment variables
  loadEnvFile();
})(); 