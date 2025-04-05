import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Strikethrough, Code, Highlighter } from 'lucide-react';
import SpellCheckerService from '../../services/SpellCheckerService';
import SpellCheckPopover from './SpellCheckPopover';
// Note: Removed unused Link import

const EmailEditor = ({ initialContent, onChange, placeholder }) => {
  // Initialize editor state
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        // Try to parse as raw JSON
        const rawContent = JSON.parse(initialContent);
        return EditorState.createWithContent(convertFromRaw(rawContent));
      } catch (e) {
        // If parsing fails, use as plain text
        return EditorState.createWithContent(ContentState.createFromText(initialContent));
      }
    }
    return EditorState.createEmpty();
  });
  
  // Spell check state
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [spellCheckInitialized, setSpellCheckInitialized] = useState(false);
  const [misspelledWord, setMisspelledWord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const editorRef = useRef(null);
  const isFirstRender = useRef(true); // This ref tracks if it's the first render
  
  // Initialize spell checker
  useEffect(() => {
    const initSpellChecker = async () => {
      try {
        await SpellCheckerService.initialize();
        setSpellCheckInitialized(true);
      } catch (error) {
        console.error('Failed to initialize spell checker:', error);
      }
    };
    
    initSpellChecker();
  }, []);
  
  // Update parent component when content changes
  useEffect(() => {
    if (onChange && !isFirstRender.current) {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      onChange(JSON.stringify(rawContent));
    }
    
    // After first render, set to false
    isFirstRender.current = false;
    
    // Note: We deliberately exclude onChange from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState]);
  
  // Handle editor state changes
  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };
  
  // Get current selection coordinates for popover positioning
  const getSelectionCoordinates = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      x: rect.left,
      y: rect.bottom + 10 // Position below the text
    };
  };
  
  // Handle key commands (bold, italic, etc.)
  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    
    return 'not-handled';
  };
  
  // Map key bindings
  const mapKeyToEditorCommand = (e) => {
    return getDefaultKeyBinding(e);
  };
  
  // Toggle inline styles (bold, italic, etc.)
  const toggleInlineStyle = (style) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };
  
  // Toggle block types (lists, blockquotes, etc.)
  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };
  
  // Focus the editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  // Check if an inline style is active
  const isInlineStyleActive = (style) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style);
  };
  
  // Check if a block type is active
  const isBlockTypeActive = (blockType) => {
    const selection = editorState.getSelection();
    const currentBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    
    return currentBlockType === blockType;
  };
  
  // Handle word selection for spell checking
  const handleSpellCheck = (event) => {
    if (!spellCheckEnabled || !spellCheckInitialized) return;
    
    // Get the selected text
    const selection = window.getSelection();
    if (!selection.toString()) return;
    
    const selectedText = selection.toString().trim();
    
    // Don't check empty selections or very long ones
    if (!selectedText || selectedText.length > 30 || selectedText.includes(' ')) return;
    
    // Check if the word is misspelled
    const isCorrect = SpellCheckerService.checkWord(selectedText);
    if (!isCorrect) {
      // Get position for popover
      const coords = getSelectionCoordinates();
      if (!coords) return;
      
      // Get suggestions
      const wordSuggestions = SpellCheckerService.getSuggestions(selectedText);
      
      setMisspelledWord(selectedText);
      setSuggestions(wordSuggestions);
      setPopoverPosition(coords);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    
    // Create a new content state with the replacement
    const newContentState = contentState.merge({
      selectionBefore: selectionState,
      selectionAfter: selectionState.merge({
        anchorOffset: selectionState.getAnchorOffset() + suggestion.length,
        focusOffset: selectionState.getAnchorOffset() + suggestion.length
      })
    });
    
    // Insert the suggestion
    const newEditorState = EditorState.push(
      editorState,
      newContentState.setBlockData(
        selectionState.getStartKey(),
        contentState.getBlockForKey(selectionState.getStartKey()).getData()
      ),
      'insert-characters'
    );
    
    handleEditorChange(newEditorState);
    setMisspelledWord(null);
    setSuggestions([]);
  };
  
  // Handle ignoring a word
  const handleIgnoreWord = (word) => {
    SpellCheckerService.ignoreWord(word);
    setMisspelledWord(null);
    setSuggestions([]);
  };
  
  // Close the spelling popover
  const handleClosePopover = () => {
    setMisspelledWord(null);
    setSuggestions([]);
  };
  
  // Custom style map for the editor
  const styleMap = {
    'HIGHLIGHT': {
      backgroundColor: '#ffeb3b',
    },
    'STRIKETHROUGH': {
      textDecoration: 'line-through',
    },
    'CODE': {
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      padding: '2px 4px',
      borderRadius: '3px',
    },
  };
  
  return (
    <div className="email-editor">
      {/* Toolbar */}
      <div className="toolbar flex flex-wrap gap-1 p-2 border border-border dark:border-gray-700 rounded-t-md bg-muted dark:bg-gray-800">
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('BOLD') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('BOLD')}
        >
          <Bold size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('ITALIC') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('ITALIC')}
        >
          <Italic size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('UNDERLINE') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('UNDERLINE')}
        >
          <Underline size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('STRIKETHROUGH') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('STRIKETHROUGH')}
        >
          <Strikethrough size={18} />
        </button>
        
        <div className="border-r border-gray-300 dark:border-gray-600 mx-1 h-6"></div>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isBlockTypeActive('unordered-list-item') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleBlockType('unordered-list-item')}
        >
          <List size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('CODE') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('CODE')}
        >
          <Code size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isInlineStyleActive('HIGHLIGHT') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleInlineStyle('HIGHLIGHT')}
        >
          <Highlighter size={18} />
        </button>
        
        <div className="border-r border-gray-300 dark:border-gray-600 mx-1 h-6"></div>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isBlockTypeActive('left') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleBlockType('left')}
        >
          <AlignLeft size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isBlockTypeActive('center') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleBlockType('center')}
        >
          <AlignCenter size={18} />
        </button>
        
        <button
          type="button"
          className={`p-1 rounded ${
            isBlockTypeActive('right') 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => toggleBlockType('right')}
        >
          <AlignRight size={18} />
        </button>
        
        <div className="ml-auto">
          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              className="mr-2"
              checked={spellCheckEnabled}
              onChange={() => setSpellCheckEnabled(!spellCheckEnabled)}
            />
            Spell Check
          </label>
        </div>
      </div>
      
      {/* Editor */}
      <div 
        className="border border-border dark:border-gray-700 border-t-0 rounded-b-md bg-background dark:bg-gray-900 min-h-[200px] p-3"
        onClick={focusEditor}
        onMouseUp={handleSpellCheck}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          placeholder={placeholder || "Compose your email..."}
          customStyleMap={styleMap}
          spellCheck={false} // We handle our own spell checking
        />
      </div>
      
      {/* Spell Check Popover */}
      {misspelledWord && (
        <SpellCheckPopover
          word={misspelledWord}
          suggestions={suggestions}
          position={popoverPosition}
          onSelect={handleSuggestionSelect}
          onIgnore={handleIgnoreWord}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
};

EmailEditor.propTypes = {
  initialContent: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
};

export default EmailEditor; 