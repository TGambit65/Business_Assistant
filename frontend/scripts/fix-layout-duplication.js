const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve(__dirname, '../src/pages');

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file imports AppLayout and uses it as a wrapper
  if (content.includes('import AppLayout from') && 
      content.includes('<AppLayout>') && 
      content.includes('</AppLayout>')) {
    
    console.log(`Fixing layout duplication in: ${filePath}`);
    
    // Remove the import
    let updatedContent = content.replace(/import AppLayout from .*;\n/, '');
    
    // Remove the AppLayout wrapper tags
    updatedContent = updatedContent.replace(/<AppLayout>\s*/, '');
    updatedContent = updatedContent.replace(/\s*<\/AppLayout>/, '');
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✓ Fixed: ${filePath}`);
  }
}

// Function to process a directory recursively
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  });
}

console.log('Starting to fix layout duplication in page components...');
processDirectory(pagesDir);
console.log('Completed fixing layout duplication issues.'); 