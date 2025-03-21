import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

export default function EmailEditor({
  initialContent = "",
  onSave,
  onCancel,
  darkMode = false,
  showButtons = true,
  emailToEdit = null,
  placeholder = "Type your email here...",
}) {
  const [content, setContent] = useState(initialContent);
  
  // Update content if emailToEdit changes
  useEffect(() => {
    if (emailToEdit?.content) {
      setContent(emailToEdit.content);
    }
  }, [emailToEdit]);

  const handleEditorChange = (content) => {
    setContent(content);
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className="border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
        style={{ 
          minHeight: '200px',
          maxHeight: 'calc(100vh - 250px)'
        }}
      >
        <RichTextEditor
          initialValue={content}
          onChange={handleEditorChange}
          onSave={onSave}
          onCancel={onCancel}
          darkMode={darkMode}
          showButtons={showButtons}
          emailToEdit={emailToEdit}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

