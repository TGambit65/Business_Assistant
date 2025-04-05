import React, { createContext, useContext, useState } from 'react';
import FeaturePreviewModal from '../components/ui/FeaturePreviewModal';

const FeaturePreviewContext = createContext(null);

export const useFeaturePreview = () => {
  const context = useContext(FeaturePreviewContext);
  if (!context) {
    throw new Error('useFeaturePreview must be used within a FeaturePreviewProvider');
  }
  return context;
};

export const FeaturePreviewProvider = ({ children }) => {
  const [preview, setPreview] = useState({
    isOpen: false,
    title: '',
    description: '',
    benefits: [],
    estimatedRelease: null
  });

  const showFeaturePreview = (title, description, benefits, estimatedRelease) => {
    setPreview({
      isOpen: true,
      title,
      description,
      benefits,
      estimatedRelease
    });
  };

  const closeFeaturePreview = () => {
    setPreview(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <FeaturePreviewContext.Provider value={{ showFeaturePreview }}>
      {children}
      <FeaturePreviewModal
        isOpen={preview.isOpen}
        onClose={closeFeaturePreview}
        title={preview.title}
        description={preview.description}
        benefits={preview.benefits}
        estimatedRelease={preview.estimatedRelease}
      />
    </FeaturePreviewContext.Provider>
  );
};

export default FeaturePreviewProvider; 