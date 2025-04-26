import React from 'react';
import { Button } from './button';

const FeaturePreviewModal = ({ isOpen, onClose, title, description, benefits, estimatedRelease }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
            {estimatedRelease && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estimated Release: {estimatedRelease}
              </p>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>

          {benefits && benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                {benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button onClick={onClose} variant="outline">
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePreviewModal; 