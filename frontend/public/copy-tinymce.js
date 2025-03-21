const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const SOURCE_DIR = path.resolve(__dirname, '../node_modules/tinymce');
const TARGET_DIR = path.resolve(__dirname, './tinymce');

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Function to copy TinyMCE files
function copyTinyMCE() {
  try {
    console.log('Copying TinyMCE from node_modules to public directory...');
    
    // Use rsync or cp depending on platform
    if (process.platform === 'win32') {
      // Windows - use robocopy or xcopy
      execSync(`xcopy "${SOURCE_DIR}" "${TARGET_DIR}" /E /I /Y`);
    } else {
      // Unix-like systems - use rsync
      execSync(`rsync -a "${SOURCE_DIR}/" "${TARGET_DIR}/"`);
    }
    
    console.log('TinyMCE copied successfully!');
  } catch (error) {
    console.error('Error copying TinyMCE:', error.message);
    process.exit(1);
  }
}

// Run the copy function
copyTinyMCE(); 