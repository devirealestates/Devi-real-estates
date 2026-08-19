import React, { useState } from 'react';
import WatermarkOverlay from './WatermarkOverlay';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspectRatioClass?: string;
  watermarkSize?: 'sm' | 'md' | 'lg';
  showWatermark?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  children?: React.ReactNode;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  aspectRatioClass = '',
  watermarkSize = 'md',
  showWatermark = true,
  onClick,
  fallbackSrc = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=500',
  loading = 'lazy',
  children,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden select-none protected-media ${aspectRatioClass} ${className}`}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Actual Image Element with security attributes */}
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        loading={loading}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-300 pointer-events-none protected-img ${imgClassName}`}
      />

      {/* Invisible Transparent Security Shield Layer */}
      <div 
        className="absolute inset-0 z-10 select-none cursor-inherit"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Center Diagonal Security Watermark */}
      {showWatermark && (
        <WatermarkOverlay
          variant="center"
          size={watermarkSize}
        />
      )}

      {/* Custom Child Elements (e.g. Action buttons, Badges) */}
      {children}
    </div>
  );
};

export default ProtectedImage;
