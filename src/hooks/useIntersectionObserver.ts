import { useEffect, useRef, useState, useCallback } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  triggerOnce?: boolean;
  delay?: number;
}

export const useIntersectionObserver = <T extends Element>(
  options: IntersectionOptions = {},
  onIntersect?: (entry: IntersectionObserverEntry) => void
) => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    triggerOnce = false,
    delay = 0
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T | null>(null);
  const frozen = isIntersecting && freezeOnceVisible;

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    
    if (triggerOnce && hasTriggered) return;

    if (delay > 0) {
      setTimeout(() => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasTriggered(true);
          onIntersect?.(entry);
        }
      }, delay);
    } else {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        setHasTriggered(true);
        onIntersect?.(entry);
      }
    }
  }, [delay, triggerOnce, hasTriggered, onIntersect]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || frozen) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      root,
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold, root, rootMargin, frozen]);

  return {
    ref: elementRef,
    isIntersecting,
    hasTriggered,
    setIsIntersecting
  };
};

// Utility hook for lazy loading images
export const useLazyImage = (
  src: string,
  placeholderSrc?: string,
  options: IntersectionOptions = {}
) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');

  const { ref, isIntersecting } = useIntersectionObserver<HTMLImageElement>({
    threshold: 0,
    triggerOnce: true,
    ...options
  });

  useEffect(() => {
    if (!isIntersecting || loaded) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
    };
  }, [isIntersecting, src, loaded]);

  return {
    ref,
    loaded,
    currentSrc
  };
};

export default useIntersectionObserver;