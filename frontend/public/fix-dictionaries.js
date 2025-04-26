/**
 * Dictionary Fixer Script
 * 
 * This script normalizes Hunspell dictionary files for Typo.js:
 * 1. Removes BOM markers
 * 2. Converts line endings to LF (Unix style)
 * 3. Updates word count to match actual count
 * 4. Normalizes format and encoding
 * 
 * Usage: Run this script in a browser console while on the spellcheck-test.html page
 */

// Function to fetch a file from server
async function fetchFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    
    // Get the file as an array buffer to handle binary data
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

// Function to check if a file starts with BOM
function hasBOM(buffer) {
  // UTF-8 BOM is EF BB BF (239 187 191)
  if (buffer.byteLength >= 3) {
    const view = new Uint8Array(buffer);
    return view[0] === 239 && view[1] === 187 && view[2] === 191;
  }
  return false;
}

// Function to remove BOM if present
function removeBOM(buffer) {
  if (hasBOM(buffer)) {
    console.log('BOM detected, removing...');
    return buffer.slice(3);
  }
  return buffer;
}

// Function to convert CRLF to LF
function normalizeLine(str) {
  return str.replace(/\r\n/g, '\n');
}

// Function to fix the dictionary files
async function fixDictionaryFiles() {
  const status = document.createElement('div');
  status.innerHTML = '<h3>Fixing Dictionary Files...</h3>';
  document.body.appendChild(status);
  
  try {
    // Fetch the dictionary files
    const affBuffer = await fetchFile('/dictionaries/en_US.aff');
    const dicBuffer = await fetchFile('/dictionaries/en_US.dic');
    
    if (!affBuffer || !dicBuffer) {
      status.innerHTML = '<h3 style="color:red;">Failed to load dictionary files</h3>';
      return;
    }
    
    // Process the AFF file
    const affNoBOM = removeBOM(affBuffer);
    const affText = normalizeLine(new TextDecoder('utf-8').decode(affNoBOM));
    
    // Process the DIC file
    const dicNoBOM = removeBOM(dicBuffer);
    const dicText = normalizeLine(new TextDecoder('utf-8').decode(dicNoBOM));
    
    // Fix the DIC file (update word count)
    const dicLines = dicText.split('\n').filter(line => line.trim().length > 0);
    const wordCount = dicLines.length - 1; // Subtract header line
    const fixedDicText = `${wordCount}\n${dicLines.slice(1).join('\n')}`;
    
    // Create downloadable versions of the fixed files
    createDownloadLink(affText, 'en_US.aff');
    createDownloadLink(fixedDicText, 'en_US.dic');
    
    // Show summary of changes
    status.innerHTML = `
      <h3 style="color:green;">Dictionary Files Fixed!</h3>
      <ul>
        <li>BOM Markers Removed</li>
        <li>Line Endings Normalized to LF</li>
        <li>Word Count Updated to ${wordCount}</li>
      </ul>
      <p>Download the fixed files using the links above, then replace the existing dictionary files.</p>
      <p>After replacing, refresh the page and run the tests again to verify the fix.</p>
    `;
  } catch (error) {
    status.innerHTML = `<h3 style="color:red;">Error: ${error.message}</h3>`;
    console.error('Error fixing dictionary:', error);
  }
}

// Function to create a download link for a text file
function createDownloadLink(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.textContent = `Download fixed ${filename}`;
  link.style.display = 'block';
  link.style.margin = '10px 0';
  link.style.padding = '8px 16px';
  link.style.backgroundColor = '#4CAF50';
  link.style.color = 'white';
  link.style.textDecoration = 'none';
  link.style.display = 'inline-block';
  link.style.borderRadius = '4px';
  
  document.body.appendChild(link);
  
  // Keep track of links to revoke URLs later
  if (!window.downloadLinks) window.downloadLinks = [];
  window.downloadLinks.push({ url, link });
  
  return link;
}

// Function to create a minimal working dictionary
function createMinimalDictionary() {
  const basicWords = [
    'hello', 'world', 'test', 'dictionary', 'typo', 'javascript',
    'example', 'word', 'computer', 'program', 'spellcheck', 'correct',
    'incorrect', 'misspelled', 'language', 'english', 'text', 'editor',
    'draftjs', 'plugin', 'browser', 'web', 'development', 'programming',
    'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
    'We', 'They', 'She', 'He', 'It', 'You', 'I', 'me', 'us', 'them', 'him', 'her',
    'apple', 'orange', 'banana', 'grape', 'fruit', 'vegetable', 'food', 'drink',
    'timeline' // Add this word since it was flagged as misspelled
  ];
  
  // Create simple aff file - use ISO8859-1 to match main dictionary
  const affData = `SET ISO8859-1
TRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'
WORDCHARS 0123456789'`;
  
  // Create simple dic file
  const dicData = `${basicWords.length}
${basicWords.join('\n')}`;
  
  // Create download links
  createDownloadLink(affData, 'minimal_en_US.aff');
  createDownloadLink(dicData, 'minimal_en_US.dic');
  
  const status = document.createElement('div');
  status.innerHTML = `
    <h3 style="color:green;">Minimal Dictionary Created!</h3>
    <p>Download both files and replace your existing dictionary files.</p>
    <p>This minimal dictionary contains ${basicWords.length} words - enough for testing.</p>
    <p>Note: The dictionary uses ISO8859-1 encoding to match the application requirements.</p>
  `;
  document.body.appendChild(status);
}

// Function to export the custom dictionary
function exportCustomDictionary() {
  try {
    const stored = localStorage.getItem('draftjs_custom_dictionary');
    if (!stored) {
      alert('No custom dictionary found. Add words to your dictionary first.');
      return;
    }
    
    const customWords = JSON.parse(stored);
    if (customWords.length === 0) {
      alert('Custom dictionary is empty. Add words to your dictionary first.');
      return;
    }
    
    // Format as a simple dictionary file
    const dicData = `${customWords.length}
${customWords.join('\n')}`;
    
    createDownloadLink(dicData, 'custom_dictionary.dic');
    
    const status = document.createElement('div');
    status.innerHTML = `
      <h3 style="color:green;">Custom Dictionary Exported!</h3>
      <p>Downloaded ${customWords.length} custom words.</p>
    `;
    document.body.appendChild(status);
    
  } catch (error) {
    alert('Error exporting custom dictionary: ' + error.message);
    console.error('Error exporting custom dictionary:', error);
  }
}

// Function to import words into the custom dictionary
function importCustomDictionary() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.dic';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function() {
      try {
        const contents = reader.result;
        const lines = contents.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        // Skip the first line if it's a number (dictionary word count)
        const startIdx = /^\d+$/.test(lines[0]) ? 1 : 0;
        const words = lines.slice(startIdx);
        
        if (words.length === 0) {
          alert('No words found in the imported file.');
          return;
        }
        
        // Get existing custom dictionary
        let customWords = [];
        const stored = localStorage.getItem('tinymce_custom_dictionary');
        if (stored) {
          customWords = JSON.parse(stored);
        }
        
        // Add new words
        let addedCount = 0;
        for (const word of words) {
          const cleanWord = word.trim();
          if (cleanWord && !customWords.includes(cleanWord)) {
            customWords.push(cleanWord);
            addedCount++;
          }
        }
        
        // Save back to localStorage
        localStorage.setItem('draftjs_custom_dictionary', JSON.stringify(customWords));
        
        const status = document.createElement('div');
        status.innerHTML = `
          <h3 style="color:green;">Custom Dictionary Updated!</h3>
          <p>Added ${addedCount} new words to your custom dictionary.</p>
          <p>Total words in custom dictionary: ${customWords.length}</p>
        `;
        document.body.appendChild(status);
        
      } catch (error) {
        alert('Error importing dictionary: ' + error.message);
        console.error('Error importing dictionary:', error);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Function to view the custom dictionary
function viewCustomDictionary() {
  try {
    const stored = localStorage.getItem('tinymce_custom_dictionary');
    if (!stored) {
      alert('No custom dictionary found. Add words to your dictionary first.');
      return;
    }
    
    const customWords = JSON.parse(stored);
    if (customWords.length === 0) {
      alert('Custom dictionary is empty. Add words to your dictionary first.');
      return;
    }
    
    const status = document.createElement('div');
    status.innerHTML = `
      <h3>Custom Dictionary Contents</h3>
      <p>Total words: ${customWords.length}</p>
      <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0; white-space: pre; font-family: monospace;">${customWords.join('\n')}</div>
    `;
    document.body.appendChild(status);
    
  } catch (error) {
    alert('Error viewing custom dictionary: ' + error.message);
    console.error('Error viewing custom dictionary:', error);
  }
}

// Add buttons to the page
function addFixButtons() {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.margin = '20px 0';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.flexWrap = 'wrap';
  document.body.insertBefore(buttonContainer, document.body.firstChild);
  
  const fixButton = document.createElement('button');
  fixButton.textContent = 'Fix Dictionary Files';
  fixButton.onclick = fixDictionaryFiles;
  fixButton.style.padding = '8px 16px';
  buttonContainer.appendChild(fixButton);
  
  const minimalButton = document.createElement('button');
  minimalButton.textContent = 'Create Minimal Dictionary';
  minimalButton.onclick = createMinimalDictionary;
  minimalButton.style.padding = '8px 16px';
  buttonContainer.appendChild(minimalButton);
  
  // Add custom dictionary management buttons
  const viewButton = document.createElement('button');
  viewButton.textContent = 'View Custom Dictionary';
  viewButton.onclick = viewCustomDictionary;
  viewButton.style.padding = '8px 16px';
  buttonContainer.appendChild(viewButton);
  
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Custom Dictionary';
  exportButton.onclick = exportCustomDictionary;
  exportButton.style.padding = '8px 16px';
  buttonContainer.appendChild(exportButton);
  
  const importButton = document.createElement('button');
  importButton.textContent = 'Import Words';
  importButton.onclick = importCustomDictionary;
  importButton.style.padding = '8px 16px';
  buttonContainer.appendChild(importButton);
}

// Run when script loads
addFixButtons(); 