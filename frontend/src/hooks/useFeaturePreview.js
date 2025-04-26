import { useFeaturePreview } from '../contexts/FeaturePreviewContext';
import { FEATURE_PREVIEWS } from '../utils/featurePreviews';

export const useShowFeaturePreview = () => {
  const { showFeaturePreview } = useFeaturePreview();

  const showPreview = (featureKey) => {
    const preview = FEATURE_PREVIEWS[featureKey];
    if (preview) {
      showFeaturePreview(
        preview.title,
        preview.description,
        preview.benefits,
        preview.estimatedRelease
      );
    } else {
      console.warn(`No preview found for feature: ${featureKey}`);
    }
  };

  return showPreview;
}; 