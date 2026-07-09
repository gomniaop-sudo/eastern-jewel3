/**
 * Optimized Image Component
 * Lazy loading, placeholder, blur effect, fallback, CLS prevention
 */

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { ImageOff } from 'lucide-react';

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: string;
  blur?: boolean;
  lazy?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231a1a1a" width="400" height="300"/%3E%3C/svg%3E';

function ImageComponent({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  placeholder = defaultPlaceholder,
  blur = true,
  lazy = true,
  sizes = '100vw',
  onLoad,
  onError,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  const aspectRatioStyle = aspectRatio !== 'auto' ? { aspectRatio } : {};
  const objectFitStyle = { objectFit };

  const showPlaceholder = !isLoaded || hasError;
  const showBlur = blur && !isLoaded && !hasError;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={aspectRatioStyle}
      role="img"
      aria-label={alt}
    >
      {showPlaceholder && (
        <div
          className={`absolute inset-0 bg-luxury-light/20 ${
            placeholder ? '' : 'animate-pulse'
          }`}
          aria-hidden="true"
        >
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover blur-xl scale-110 opacity-50"
            />
          ) : null}
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-luxury-light/10 flex items-center justify-center" aria-hidden="true">
          <ImageOff className="w-12 h-12 text-gray-500" />
        </div>
      )}

      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            showBlur ? 'opacity-0 scale-105 blur-lg' : 'opacity-100'
          }`}
          style={objectFitStyle}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Screen reader text */}
      {hasError && (
        <span className="sr-only">
          {alt} - Image failed to load
        </span>
      )}
    </div>
  );
}

export const Image = memo(ImageComponent);
export default Image;
