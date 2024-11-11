import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface Dimensions {
  width: number;
  height: number;
}

interface UseResizeOptions {
  debounceTime?: number;
  initialDimensions?: Dimensions;
  onResize?: (dimensions: Dimensions) => void;
}

export const useResize = ({
  debounceTime = 250,
  initialDimensions,
  onResize
}: UseResizeOptions = {}) => {
  const [dimensions, setDimensions] = useState<Dimensions>(() => {
    if (initialDimensions) return initialDimensions;
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });

  const handleResize = useCallback(
    debounce(() => {
      const newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setDimensions(newDimensions);
      onResize?.(newDimensions);
    }, debounceTime),
    [debounceTime, onResize]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const { width, height } = dimensions;
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const isLandscape = width > height;

  return {
    width,
    height,
    isDesktop,
    isTablet,
    isMobile,
    isLandscape,
    dimensions
  };
};

// Utility hook for element resizing
export const useElementResize = <T extends HTMLElement>(
  options: UseResizeOptions = {}
) => {
  const [ref, setRef] = useState<T | null>(null);
  const [elementDimensions, setElementDimensions] = useState<Dimensions>({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (!ref) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const newDimensions = { width, height };
      
      setElementDimensions(newDimensions);
      options.onResize?.(newDimensions);
    });

    resizeObserver.observe(ref);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, options.onResize]);

  return {
    ref: setRef,
    ...elementDimensions
  };
};

export default useResize;