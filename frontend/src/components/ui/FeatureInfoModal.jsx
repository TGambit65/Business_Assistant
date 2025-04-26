import React from 'react';
import { X, Shield, LucideInfo } from 'lucide-react';
import { Button } from './button';

export default function FeatureInfoModal({ isOpen, onClose, title, description, steps, benefits, security, image, releaseDate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-background dark:bg-gray-800 rounded-lg shadow-lg p-6 m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground dark:text-gray-100">{title}</h2>
          {releaseDate && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Coming {releaseDate}
            </p>
          )}
        </div>
        
        {/* Image (if provided) */}
        {image && (
          <div className="mb-4">
            <img src={image} alt={title} className="w-full h-auto rounded-md" />
          </div>
        )}
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
        
        {/* Steps */}
        {steps && steps.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-foreground dark:text-gray-100 mb-2 flex items-center">
              <LucideInfo className="h-4 w-4 mr-2" />
              Steps:
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              {steps.map((step, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-foreground dark:text-gray-100 mb-2">
              Business Benefits:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{benefit}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Security Info */}
        {security && security.length > 0 && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <h3 className="text-md font-semibold text-foreground dark:text-gray-100 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security Information:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {security.map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Close button */}
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 