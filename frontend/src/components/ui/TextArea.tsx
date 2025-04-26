import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

let idCounter = 0; // Simple counter for unique IDs

export const TextArea: React.FC<TextAreaProps> = ({
  id: providedId, // Accept id prop
  label,
  error,
  className = '',
  ...props
}) => {
  // Generate a unique ID for accessibility
  const id = providedId || props.name || `textarea-${idCounter++}`; // Use providedId first

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id} // Add id to textarea
        className={`
          w-full rounded-md border border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          disabled:bg-muted disabled:text-gray-500
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 