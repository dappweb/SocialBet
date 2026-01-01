import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNyIvPjwvc3ZnPg==',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    let isCancelled = false;

    if (imgRef.current && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isCancelled) {
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px',
        }
      );
      observer.observe(imgRef.current);
    }

    return () => {
      isCancelled = true;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, placeholder, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        className,
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        hasError && 'opacity-50'
      )}
      loading="lazy"
      decoding="async"
      fetchPriority={imageSrc === placeholder ? 'low' : 'auto'}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default LazyImage;

