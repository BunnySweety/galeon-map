'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

// Hook pour l'intersection observer simplifié
const useIntersectionObserver = (elementRef: React.RefObject<HTMLDivElement | null>) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return isIntersecting;
};

export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  onLoad,
  onError,
}: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imageRef = useRef<HTMLDivElement | null>(null);
  
  const isIntersecting = useIntersectionObserver(imageRef);

  useEffect(() => {
    if (isIntersecting && !shouldLoad && !priority) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder pendant le chargement
  const PlaceholderComponent = () => (
    <div
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Composant d'erreur
  const ErrorComponent = () => (
    <div
      className={`bg-red-100 border border-red-300 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg
        className="w-8 h-8 text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <div ref={imageRef} className="relative">
      {hasError ? (
        <ErrorComponent />
      ) : !shouldLoad ? (
        <PlaceholderComponent />
      ) : (
        <>
          {!isLoaded && <PlaceholderComponent />}
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            quality={quality}
            className={className}
            style={{
              transition: 'opacity 0.3s ease-in-out',
              opacity: isLoaded ? 1 : 0,
            }}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </>
      )}
    </div>
  );
} 