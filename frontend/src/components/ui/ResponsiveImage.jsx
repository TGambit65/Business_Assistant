import React, { useState, useEffect } from 'react';

const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  width,
  height,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23cccccc" /%3E%3C/svg%3E',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Create new image object to preload
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }} {...props}>
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-60'}
        `}
        sizes={sizes}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          // Keep placeholder on error
        }}
      />
    </div>
  );
};

export default ResponsiveImage; 