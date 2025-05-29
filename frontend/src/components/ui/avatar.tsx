import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  className,
  ...props
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-600">
          {fallback || alt.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
    </div>
  );
};

export default Avatar;