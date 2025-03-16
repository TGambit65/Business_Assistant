/* 
  robust_spellchecker.js

  A more advanced TinyMCE plugin that:
  1) Adds a "Spellcheck" toolbar button.
  2) Highlights misspelled words in the editor using Typo.js.
  3) Lets the user cycle through each misspelling and either replace or ignore.

  Note: This plugin handles basic spellcheck via Typo.js.
  For advanced grammar checks, a different solution is needed.
*/

tinymce.PluginManager.add('robust_spellchecker', function (editor) {
    // Load dictionary using Typo.js; ensure dictionary files are in /dictionaries/
    let dictionary;
    
    // Function to fetch a file and return its contents as text
    function fetchFileContents(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        // Explicitly set to ISO8859-1 instead of UTF-8
        xhr.overrideMimeType("text/plain; charset=ISO8859-1");
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Failed to fetch ${url}: ${xhr.status}`));
            }
          }
        };
        xhr.send();
      });
    }
    
    // Function to initialize the dictionary with proper configuration
    function initDictionary() {
      // Return a promise that resolves when the dictionary is loaded
      return new Promise((resolve, reject) => {
        console.log("Starting dictionary initialization...");
        
        // Always use direct loading with ISO8859-1 encoding for reliability
        Promise.all([
          fetchFileContents('/dictionaries/en_US.aff'),
          fetchFileContents('/dictionaries/en_US.dic')
        ]).then(([affData, dicData]) => {
          console.log("AFF file size:", affData.length);
          console.log("DIC file size:", dicData.length);
          console.log("AFF first line:", affData.split('\n')[0]);
          console.log("DIC first line:", dicData.split('\n')[0]);
          
          try {
            // Create the dictionary with direct file data and ISO8859-1 encoding
            dictionary = new Typo("en_US", affData, dicData, { 
              platform: "any",
              dictionaryEncoding: "ISO8859-1"
            });
            
            console.log("Dictionary loaded successfully:", dictionary);
            console.log("Dictionary word count:", Object.keys(dictionary.dictionaryTable).length);
            
            // Test a few words
            console.log("Dictionary test - 'hello':", dictionary.check("hello"));
            console.log("Dictionary test - 'helo':", dictionary.check("helo"));
            console.log("Dictionary test - 'We':", dictionary.check("We"));
            
            // Log dictionary statistics
            console.log("Dictionary rules count:", Object.keys(dictionary.rules).length);
            console.log("Dictionary table size:", Object.keys(dictionary.dictionaryTable).length);
            
            if (dictionary && dictionary.dictionaryTable && Object.keys(dictionary.dictionaryTable).length > 0) {
              resolve(dictionary);
            } else {
              reject(new Error("Dictionary loaded but contains no words"));
            }
          } catch (e) {
            console.error("Error creating dictionary with direct file data:", e);
            reject(e);
          }
        }).catch(error => {
          console.error("Failed to fetch dictionary files:", error);
          reject(error);
        });
      });
    }
  
    // CSS class used to highlight misspelled words
    const MISSPELLED_CLASS = 'mce-misspelled-word';
  
    // Variables to track highlighted misspellings and current index
    let allHighlights = [];
    let currentIndex = 0;
  
    /**
     * Recursive function to traverse DOM nodes.
     * Skip nodes that are already within a highlight span.
     */
    function walk(node, callback) {
      if (node.parentNode &&
          node.parentNode.classList &&
          node.parentNode.classList.contains(MISSPELLED_CLASS)) {
        return;
      }
      callback(node);
      for (let child = node.firstChild; child; child = child.nextSibling) {
        walk(child, callback);
      }
    }
  
    /**
     * Remove previously added highlight spans by replacing each span with its plain text.
     */
    function removeOldHighlights() {
      const spans = editor.dom.select(`span.${MISSPELLED_CLASS}`);
      spans.forEach((span) => {
        const text = span.textContent;
        span.parentNode.replaceChild(document.createTextNode(text), span);
      });
    }
    
    /**
     * Check if a word is correctly spelled.
     * Handles special cases and tries multiple variations before declaring a misspelling.
     */
    function isWordMisspelled(word) {
      // Skip if empty or non-word
      if (!word || word.length === 0) return false;
      
      // Skip URLs, email addresses, etc.
      if (word.match(/^(https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/) !== null) {
        return false;
      }
      
      // Skip numbers and IDs
      if (word.match(/^\d+([a-z]+)?$/) !== null) {
        return false;
      }
      
      // Clean word of punctuation
      const cleanedWord = word.replace(/[^A-Za-z']/g, '').replace(/['\u2019]+$/, '').replace(/^['\u2019]+/, '');
      if (cleanedWord.length === 0) return false;
      
      // If dictionary failed to load, consider all words valid to avoid marking everything
      if (!dictionary || !dictionary.dictionaryTable || Object.keys(dictionary.dictionaryTable).length === 0) {
        console.warn("Dictionary not properly loaded. Skipping spellcheck for:", word);
        return false;
      }
      
      // Try different case variations
      const variations = [
        cleanedWord,                // Original
        cleanedWord.toLowerCase(),  // lowercase
        cleanedWord.toUpperCase(),  // UPPERCASE
        cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase() // Titlecase
      ];
      
      // If any variation is recognized as correctly spelled, the word is valid
      for (const variant of variations) {
        if (dictionary.check(variant)) {
          return false; // Word is correctly spelled
        }
      }
      
      // All variations failed - word is misspelled
      return true;
    }
  
    /**
     * Highlight misspelled words in text nodes.
     * Only wraps words that are misspelled (using smarter checking).
     * @returns {Promise} Promise that resolves when highlighting is complete
     */
    function highlightMisspellings() {
      // Return a promise that resolves when highlighting is complete
      return new Promise((resolve, reject) => {
        // First ensure the dictionary is loaded
        const startSpellCheck = (dict) => {
          try {
            allHighlights = [];
            currentIndex = 0;
            removeOldHighlights();
            const rng = editor.selection.getRng();
            
            walk(editor.getBody(), function(node) {
              if (node.nodeType === 3 && node.nodeValue.trim().length > 0) {
                const text = node.nodeValue;
                // Improved regex to better split words
                const words = text.split(/(\s+|[,.!?;:()\[\]{}""''\u2019-])/);
                let newHtml = '';
                let lastPart = '';
                
                words.forEach((part, i) => {
                  // Keep delimiters as-is
                  if (i % 2 === 1 || part.trim().length === 0) {
                    newHtml += part;
                    lastPart = part;
                    return;
                  }
                  
                  if (isWordMisspelled(part)) {
                    // Wrap the misspelled word in a span
                    newHtml += `<span class="${MISSPELLED_CLASS}" data-word="${part}">${part}</span>`;
                  } else {
                    newHtml += part;
                  }
                });
                
                if (newHtml !== text) {
                  const wrapper = document.createElement('span');
                  wrapper.innerHTML = newHtml;
                  node.parentNode.replaceChild(wrapper, node);
                }
              }
            });
            
            editor.selection.setRng(rng);
            allHighlights = editor.dom.select(`span.${MISSPELLED_CLASS}`);
            
            // Remove the alert popup that shows count of misspellings
            if (allHighlights.length === 0) {
              // Silent return instead of alert
              console.log('No misspellings found');
            } else {
              // Just log to console instead of showing an alert
              console.log(`Found ${allHighlights.length} possible misspellings`);
            }
            
            // Resolve the promise with the dictionary
            resolve(dict);
          } catch (error) {
            reject(error);
          }
        };
        
        // Create loadDictionary function to ensure dictionary is loaded
        function loadDictionary() {
          if (dictionary && dictionary.dictionaryTable && Object.keys(dictionary.dictionaryTable).length > 0) {
            // Dictionary already loaded, proceed immediately
            return Promise.resolve(dictionary);
          } else {
            // Need to load dictionary first
            return initDictionary();
          }
        }
        
        // Load dictionary and then start spell check
        loadDictionary()
          .then(startSpellCheck)
          .catch(error => {
            console.error("Error loading dictionary:", error);
            editor.windowManager.alert(`Failed to load dictionary: ${error.message}. Please check the dictionary files.`);
            reject(error);
          });
      });
    }
  
    /**
     * Cycle through misspelled words and display a dialog with suggestions.
     */
    function stepToNextMisspelling() {
      // Make sure dictionary is loaded before proceeding
      function loadDictionary() {
        if (dictionary && dictionary.dictionaryTable && Object.keys(dictionary.dictionaryTable).length > 0) {
          // Dictionary already loaded, proceed immediately
          return Promise.resolve(dictionary);
        } else {
          // Need to load dictionary first
          return initDictionary();
        }
      }
      
      // Proceed with navigation after ensuring dictionary is loaded
      loadDictionary().then(() => {
        if (allHighlights.length === 0) {
          editor.windowManager.alert('No misspellings to navigate.');
          return;
        }
        if (currentIndex >= allHighlights.length) {
          // Don't show an alert, just reset silently
          currentIndex = 0; // Reset to allow cyclic navigation
        }
        
        const highlight = allHighlights[currentIndex];
        if (!highlight) {
          console.error("Highlight not found at index", currentIndex);
          currentIndex = 0; // Reset index
          if (allHighlights.length > 0) {
            stepToNextMisspelling(); // Try again with reset index
          }
          return;
        }
        
        editor.selection.scrollIntoView(highlight, true);
        
        // Select the misspelled word
        editor.selection.select(highlight);
        
        const rawWord = highlight.getAttribute('data-word') || '';
        const cleaned = rawWord.replace(/[^A-Za-z']/g, '');
        
        // Get suggestions, trying both original and lowercase
        let suggestions = dictionary.suggest(cleaned) || [];
        if (suggestions.length === 0) {
          suggestions = dictionary.suggest(cleaned.toLowerCase()) || [];
        }
        
        // Pre-select the most likely replacement (first suggestion)
        const selectedSuggestion = suggestions.length > 0 ? suggestions[0] : rawWord;
        
        // Create buttons for each suggestion with improved styling
        const suggestionsHtml = suggestions.length
          ? suggestions.map((sug, idx) => 
              `<button type="button" class="tox-button suggestion-button ${idx === 0 ? 'selected-suggestion' : ''}" 
               style="display:block; width:100%; margin:4px 0; text-align:left; padding:8px; 
               border-radius:4px; border:1px solid #ccc; 
               ${idx === 0 ? 'background-color:#e8f0fe; border-color:#4285F4; font-weight:bold;' : 'background-color:#fff;'}"
               data-mce-idx="${idx}" data-mce-suggestion="${sug}">${sug}</button>`
            ).join('')
          : '<div style="padding:8px 0;">No suggestions found.</div>';
      
        editor.windowManager.open({
          title: `Misspelled word: "${rawWord}"`,
          body: {
            type: 'panel',
            items: [
              {
                type: 'htmlpanel',
                html: `<p style="margin:10px 0 5px 0; font-weight:500;">Suggestions:</p>
                       <div style="max-height: 180px; overflow-y: auto; border:1px solid #e0e0e0; border-radius:4px; padding:4px; margin-bottom:12px;">
                         ${suggestionsHtml}
                       </div>`
              },
              {
                type: 'input',
                name: 'replacement',
                label: 'Edit directly:',
                initialValue: selectedSuggestion
              }
            ]
          },
          buttons: [
            { type: 'custom', name: 'add_to_dictionary', text: 'Add to Dictionary' },
            { type: 'custom', name: 'ignore', text: 'Ignore' },
            { type: 'submit', name: 'replace', text: 'Replace' },
            { type: 'custom', name: 'next', text: 'Next' }
          ],
          onAction: function(api, details) {
            if (details.name === 'ignore') {
              api.close();
              currentIndex++;
              stepToNextMisspelling();
            } else if (details.name === 'next') {
              api.close();
              currentIndex++;
              stepToNextMisspelling();
            } else if (details.name === 'add_to_dictionary') {
              addWordToDictionary(rawWord);
              
              // Remove highlight since it's now a valid word
              replaceWord(highlight, rawWord);
              allHighlights = editor.dom.select(`span.${MISSPELLED_CLASS}`);
              
              api.close();
              
              if (allHighlights.length > 0) {
                // If we're at the end, reset to beginning
                if (currentIndex >= allHighlights.length) {
                  currentIndex = 0;
                }
                stepToNextMisspelling();
              }
            }
          },
          initialData: {
            replacement: selectedSuggestion
          },
          onSubmit: function(api) {
            // Get the replacement text from the input field
            const data = api.getData();
            replaceWord(highlight, data.replacement);
            api.close();
            
            // Refresh highlights after replacing
            allHighlights = editor.dom.select(`span.${MISSPELLED_CLASS}`);
            if (allHighlights.length > 0) {
              // If we're at the end, reset to beginning
              if (currentIndex >= allHighlights.length) {
                currentIndex = 0;
              }
              stepToNextMisspelling();
            }
          },
          onClose: function() {
            // Add click handlers for suggestion buttons
            setTimeout(() => {
              const container = document.querySelector('.tox-dialog__body-content');
              if (container) {
                // Add click event listener for suggestion buttons
                container.addEventListener('click', function(e) {
                  // Check if a suggestion button was clicked
                  if (e.target && e.target.classList.contains('suggestion-button')) {
                    const suggestion = e.target.getAttribute('data-mce-suggestion');
                    
                    // Update the replacement input field with the selected suggestion
                    const dialog = document.querySelector('.tox-dialog');
                    if (dialog) {
                      const inputField = dialog.querySelector('input[type="text"]');
                      if (inputField) {
                        inputField.value = suggestion;
                        inputField.focus();
                        
                        // Update the dialog state
                        const dialogInstance = editor.windowManager.getWindows()[0];
                        if (dialogInstance) {
                          dialogInstance.setData({ replacement: suggestion });
                        }
                      }
                    }
                    
                    // Update styling to highlight the selected suggestion
                    const buttons = container.querySelectorAll('.suggestion-button');
                    buttons.forEach(button => {
                      if (button === e.target) {
                        button.classList.add('selected-suggestion');
                        button.style.backgroundColor = '#e8f0fe';
                        button.style.borderColor = '#4285F4';
                        button.style.fontWeight = 'bold';
                      } else {
                        button.classList.remove('selected-suggestion');
                        button.style.backgroundColor = '#fff';
                        button.style.borderColor = '#ccc';
                        button.style.fontWeight = 'normal';
                      }
                    });
                  }
                });
              }
            }, 50);
          }
        });
      }).catch(error => {
        console.error("Error loading dictionary for suggestions:", error);
        editor.windowManager.alert(`Failed to load dictionary: ${error.message}. Please check the dictionary files.`);
      });
    }
  
    /**
     * Replace a highlighted word with new text and remove the highlight.
     */
    function replaceWord(spanEl, newText) {
      if (!spanEl) return;
      const textNode = editor.dom.create('text', {}, newText);
      spanEl.parentNode.replaceChild(textNode, spanEl);
    }
    
    /**
     * Add a word to the custom dictionary
     */
    function addWordToDictionary(word) {
      if (!word || word.trim().length === 0) return;
      
      // Clean the word
      const cleanWord = word.trim().replace(/[^A-Za-z']/g, '');
      if (cleanWord.length === 0) return;
      
      // Store in local storage for persistence
      let customWords = [];
      try {
        const stored = localStorage.getItem('tinymce_custom_dictionary');
        if (stored) {
          customWords = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error loading custom dictionary:", e);
      }
      
      // Add the word if it's not already there
      if (!customWords.includes(cleanWord)) {
        customWords.push(cleanWord);
        localStorage.setItem('tinymce_custom_dictionary', JSON.stringify(customWords));
      }
      
      // Add the word to the in-memory dictionary
      if (dictionary && dictionary.dictionaryTable) {
        dictionary.dictionaryTable[cleanWord.toLowerCase()] = [[]];
        console.log(`Added "${cleanWord}" to custom dictionary`);
        editor.windowManager.alert(`Added "${cleanWord}" to custom dictionary.`);
      }
    }
    
    /**
     * Load custom dictionary words from storage
     */
    function loadCustomDictionary() {
      if (!dictionary || !dictionary.dictionaryTable) return;
      
      try {
        const stored = localStorage.getItem('tinymce_custom_dictionary');
        if (stored) {
          const customWords = JSON.parse(stored);
          customWords.forEach(word => {
            dictionary.dictionaryTable[word.toLowerCase()] = [[]];
          });
          console.log(`Loaded ${customWords.length} custom words`);
        }
      } catch (e) {
        console.error("Error loading custom dictionary:", e);
      }
    }
  
    // Add a toolbar button named 'robust_spellchecker'
    editor.ui.registry.addButton('robust_spellchecker', {
      text: 'Spellcheck',
      tooltip: 'Check Spelling',
      onAction: function() {
        highlightMisspellings().then(() => {
          // Load custom dictionary words
          loadCustomDictionary();
          
          if (allHighlights.length > 0) {
            // Add a small delay to ensure UI is updated
            setTimeout(() => {
              stepToNextMisspelling();
            }, 100);
          }
        }).catch(err => {
          console.error("Error in spellcheck:", err);
        });
      }
    });
  
    return {
      getMetadata: function() {
        return {
          name: "Robust Spellchecker Plugin",
          url: "https://github.com/cfinke/Typo.js"
        };
      }
    };
  });
  