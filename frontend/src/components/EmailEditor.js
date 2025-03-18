import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

const getDefaultTinyMCEConfig = (darkMode) => {
  return {
    height: 350,
    menubar: false,
    skin: darkMode ? "oxide-dark" : "oxide",
    content_css: darkMode ? "dark" : "default",
    plugins: [
      "advlist autolink lists link image charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime media table paste code help wordcount",
      "robust_spellchecker"
    ],
    mobile: {
      menubar: false,
      plugins: [
        "autolink lists link image",
        "searchreplace",
        "robust_spellchecker"
      ],
      toolbar: "undo redo | formatselect | bold italic | bullist numlist | link image | spellchecker"
    },
    toolbar: "undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | link image | spellchecker | help",
    toolbar_mode: "sliding",
    branding: false,
    resize: true,
    statusbar: true,
    setup: function (editor) {
      editor.on('ExecCommand', function (e) {
        if (e.command === 'mceSpellchecker') {
          console.log("Spellchecker activated");
        }
      });
    }
  };
};

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
        <Editor
          apiKey="your-api-key"
          initialValue={content}
          init={getDefaultTinyMCEConfig(darkMode)}
          onEditorChange={handleEditorChange}
          inline={false}
          textareaName="email-content"
          disabled={false}
          id="email-editor"
          placeholder={placeholder}
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
            onClick={() => onSave(content)}
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
}

