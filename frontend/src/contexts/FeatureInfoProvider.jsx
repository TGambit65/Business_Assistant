import React, { createContext, useContext } from 'react';
import { useFeatureInfo } from '../hooks/useFeatureInfo';
import FeatureInfoModal from '../components/ui/FeatureInfoModal';

// Create context
const FeatureInfoContext = createContext(null);

/**
 * Provider component for feature info popups
 */
export const FeatureInfoProvider = ({ children }) => {
  const { isOpen, currentFeature, showFeatureInfo, closeFeatureInfo } = useFeatureInfo();
  
  return (
    <FeatureInfoContext.Provider value={{ showFeatureInfo }}>
      {children}
      
      {/* Render the modal if a feature is selected */}
      {isOpen && currentFeature && (
        <FeatureInfoModal
          isOpen={isOpen}
          onClose={closeFeatureInfo}
          title={currentFeature.title}
          description={currentFeature.description}
          steps={currentFeature.steps}
          benefits={currentFeature.benefits}
          security={currentFeature.security}
          image={currentFeature.image}
          releaseDate={currentFeature.releaseDate}
        />
      )}
    </FeatureInfoContext.Provider>
  );
};

/**
 * Hook to access the feature info context
 */
export const useFeatureInfoContext = () => {
  const context = useContext(FeatureInfoContext);
  if (!context) {
    throw new Error('useFeatureInfoContext must be used within a FeatureInfoProvider');
  }
  return context;
}; 