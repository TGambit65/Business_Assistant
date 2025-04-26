/**
 * Generate public environment variables
 * 
 * This script reads the root .env file and creates a filtered JSON file
 * with non-sensitive environment variables that can be safely exposed to the frontend.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to the root .env file
const rootEnvPath = path.resolve(__dirname, '../.env');

// Path to output JSON file
const outputPath = path.resolve(__dirname, '../frontend/public/.env-public.json');

// List of environment variables to expose to the frontend
// IMPORTANT: Do not include sensitive API keys or secrets here
const ALLOWED_ENV_VARS = [
  'USE_DEMO_MODE',
  // Add other non-sensitive variables here
];

// Function to generate the public env file
function generatePublicEnvFile() {
  try {
    // Parse the .env file
    const envConfig = dotenv.parse(fs.readFileSync(rootEnvPath));
    
    // Filter to include only allowed variables
    const publicEnvVars = {};
    
    // Special handling for Deepseek keys - only expose partial key info for UI display
    // This creates masked versions that are safe to expose
    if (envConfig.DEEPSEEK_R1_KEY) {
      publicEnvVars.DEEPSEEK_R1_KEY_AVAILABLE = 'true';
      publicEnvVars.DEEPSEEK_R1_KEY_PREVIEW = envConfig.DEEPSEEK_R1_KEY.substring(0, 5) + '...' + 
        envConfig.DEEPSEEK_R1_KEY.substring(envConfig.DEEPSEEK_R1_KEY.length - 3);
    }
    
    if (envConfig.DEEPSEEK_V3_KEY) {
      publicEnvVars.DEEPSEEK_V3_KEY_AVAILABLE = 'true';
      publicEnvVars.DEEPSEEK_V3_KEY_PREVIEW = envConfig.DEEPSEEK_V3_KEY.substring(0, 5) + '...' + 
        envConfig.DEEPSEEK_V3_KEY.substring(envConfig.DEEPSEEK_V3_KEY.length - 3);
    }
    
    // Add all explicitly allowed variables
    for (const key of ALLOWED_ENV_VARS) {
      if (envConfig[key]) {
        publicEnvVars[key] = envConfig[key];
      }
    }
    
    // Write the filtered variables to the output file
    fs.writeFileSync(outputPath, JSON.stringify(publicEnvVars, null, 2));
    
    console.log(`Public environment variables written to ${outputPath}`);
  } catch (error) {
    console.error('Error generating public env file:', error);
  }
}

// Run the generator
generatePublicEnvFile(); 