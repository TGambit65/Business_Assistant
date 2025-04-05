import React, { useState, useEffect } from 'react';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

// Import the css for the editor
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';

const RichTextEditor = ({
  initialContent = '',
  onSave,
  onCancel,
  darkMode = false,
  showButtons = true,
  emailToEdit = null,
  placeholder = 'Type your email here...',
  onChange = null
}) => {
  // Initialize editor state from HTML content
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      const blocksFromHtml = htmlToDraft(initialContent);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  // Update content if emailToEdit changes
  useEffect(() => {
    if (emailToEdit?.content) {
      const blocksFromHtml = htmlToDraft(emailToEdit.content);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [emailToEdit]);

  // Handle editor state changes
  const handleEditorChange = (state) => {
    setEditorState(state);
    
    // Call external onChange handler if provided
    if (onChange) {
      const htmlContent = draftToHtml(convertToRaw(state.getCurrentContent()));
      onChange(htmlContent);
    }
  };

  // Get HTML content from editor state
  const getHtmlContent = () => {
    return draftToHtml(convertToRaw(editorState.getCurrentContent()));
  };

  // Customize toolbar options
  const toolbarOptions = {
    options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'remove', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough'],
    },
    blockType: {
      options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`border-2 rounded-md overflow-hidden ${
          darkMode 
            ? 'border-gray-600 bg-gray-800 text-white' 
            : 'border-gray-300 bg-background text-foreground'
        }`}
        style={{ 
          minHeight: '200px',
          maxHeight: 'calc(100vh - 250px)'
        }}
      >
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          toolbar={toolbarOptions}
          placeholder={placeholder}
          wrapperClassName={`wrapper-class ${darkMode ? 'dark-mode' : ''}`}
          editorClassName={`editor-class ${darkMode ? 'dark-mode' : ''}`}
          toolbarClassName={`toolbar-class ${darkMode ? 'dark-mode' : ''}`}
        />
      </div>

      {showButtons && (
        <div className="flex flex-wrap gap-2 justify-end mt-3">
          <button
            onClick={() => onCancel()}
            className="
              px-3 py-2 md:px-4 md:py-2 
              text-sm rounded-md
              bg-gray-200 text-gray-700 
              dark:bg-gray-700 dark:text-gray-200
              hover:bg-gray-300 dark:hover:bg-gray-600
              focus:outline-none focus:ring-2 
              focus:ring-blue-400 dark:focus:ring-orange-400
              touch-manipulation
              transition-colors
            "
          >
            Cancel
          </button>
          
          <button
            onClick={() => onSave(getHtmlContent())}
            className="
              px-3 py-2 md:px-4 md:py-2
              text-sm rounded-md
              bg-blue-500 text-white 
              dark:bg-orange-500
              hover:bg-blue-600 dark:hover:bg-orange-600
              focus:outline-none focus:ring-2 
              focus:ring-blue-500 dark:focus:ring-orange-500
              touch-manipulation
              transition-colors
            "
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 