import React, { useState, useEffect } from 'react';

/**
 * Color Picker component
 * 
 * A simple color picker component that includes both a color input and text input
 * for entering hex values directly
 * 
 * @param {string} value - The color value (hex format)
 * @param {function} onChange - Function called when color is changed
 * @param {string} label - Optional label for the color picker
 * @param {string} className - Additional CSS classes
 */
const ColorPicker = ({ value = '#000000', onChange, label, className = '' }) => {
  const [colorValue, setColorValue] = useState(value);

  // Update local state when external value changes
  useEffect(() => {
    setColorValue(value);
  }, [value]);

  // Handle color input change
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColorValue(newColor);
    onChange && onChange(newColor);
  };

  // Handle text input change
  const handleTextChange = (e) => {
    let newColor = e.target.value;
    
    // Ensure the color starts with #
    if (newColor && !newColor.startsWith('#')) {
      newColor = `#${newColor}`;
    }
    
    setColorValue(newColor);
    
    // Only call onChange if it's a valid color
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange && onChange(newColor);
    }
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <input
          type="color"
          value={colorValue}
          onChange={handleColorChange}
          className="w-8 h-8 overflow-hidden border rounded cursor-pointer"
        />
        <input
          type="text"
          value={colorValue}
          onChange={handleTextChange}
          className="flex-1 h-8 px-2 border rounded text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export default ColorPicker; 