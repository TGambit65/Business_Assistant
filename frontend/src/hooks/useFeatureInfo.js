import { useState } from 'react';

/**
 * Hook to manage feature info modals state
 */
export const useFeatureInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(null);

  const showFeatureInfo = (feature) => {
    setCurrentFeature(feature);
    setIsOpen(true);
  };

  const closeFeatureInfo = () => {
    setIsOpen(false);
    // Reset the current feature after closing animation completes
    setTimeout(() => {
      setCurrentFeature(null);
    }, 300);
  };

  return {
    isOpen,
    currentFeature,
    showFeatureInfo,
    closeFeatureInfo
  };
};

export default useFeatureInfo;