import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
// Import our TinyMCE utility
import { getDefaultTinyMCEConfig } from "../tinymcePreloader";

export default function EmailEditor({ initialContent, onSave, onCancel }) {
  const [content, setContent] = useState(initialContent || "");

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div>
      <Editor
        /** 
         * Skip loading TinyMCE since it's loaded in index.html
         */
        id="standalone-email-editor"
        inline={false}
        init={getDefaultTinyMCEConfig(300, false)}
        initialValue={initialContent}
        onEditorChange={handleEditorChange}
      />
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onSave(content)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

