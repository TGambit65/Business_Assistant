import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Check, X } from 'lucide-react';

const SpellCheckPopover = ({ 
  word, 
  suggestions, 
  position, 
  onSelect, 
  onIgnore,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const popoverRef = useRef(null);
  
  // Position the popover when it mounts
  useEffect(() => {
    if (popoverRef.current && position) {
      // Ensure popover stays within viewport
      const rect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if needed
      let left = position.x;
      if (left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 10;
      }
      
      // Adjust vertical position if needed
      let top = position.y;
      if (top + rect.height > viewportHeight) {
        top = position.y - rect.height - 10;
      }
      
      popoverRef.current.style.left = `${left}px`;
      popoverRef.current.style.top = `${top}px`;
    }
  }, [position]);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsVisible(false);
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-background dark:bg-gray-800 rounded-lg shadow-lg border border-border dark:border-gray-700 p-2 min-w-[200px]"
      style={{ 
        position: 'fixed',
        zIndex: 1000,
      }}
    >
      <div className="flex justify-between items-center mb-2 border-b border-border dark:border-gray-700 pb-2">
        <span className="font-medium text-sm text-red-500 dark:text-red-400">
          Misspelled: <span className="italic">{word}</span>
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>
      
      {suggestions.length > 0 ? (
        <div className="max-h-[150px] overflow-y-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    onSelect(suggestion);
                    setIsVisible(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Check size={14} className="mr-2 text-green-500" />
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No suggestions available</p>
      )}
      
      <div className="mt-2 pt-2 border-t border-border dark:border-gray-700 flex justify-between">
        <button
          onClick={() => {
            onIgnore(word);
            setIsVisible(false);
          }}
          className="text-xs px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Ignore
        </button>
        <button
          onClick={() => {
            // Open editor for custom correction
            const newWord = prompt("Enter correction:", word);
            if (newWord && newWord !== word) {
              onSelect(newWord);
            }
            setIsVisible(false);
          }}
          className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
        >
          <Pencil size={12} className="mr-1" />
          Edit
        </button>
      </div>
    </div>
  );
};

SpellCheckPopover.propTypes = {
  word: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onIgnore: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

SpellCheckPopover.defaultProps = {
  suggestions: []
};

export default SpellCheckPopover; 