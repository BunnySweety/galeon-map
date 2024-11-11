import { useEffect, useRef, useCallback } from 'react';

interface UseOutsideClickOptions {
  enabled?: boolean;
  excludeRefs?: React.RefObject<HTMLElement>[];
  onOutsideClick: (event: MouseEvent | TouchEvent) => void;
}

export const useOutsideClick = <T extends HTMLElement>({
  enabled = true,
  excludeRefs = [],
  onOutsideClick
}: UseOutsideClickOptions) => {
  const ref = useRef<T>(null);

  const handleClick = useCallback((event: MouseEvent | TouchEvent) => {
    if (!enabled || !ref.current) return;

    // Check if click target is inside the ref element
    const isInside = ref.current.contains(event.target as Node);

    // Check if click target is inside any of the excluded elements
    const isInsideExcluded = excludeRefs.some(
      excludeRef => excludeRef.current?.contains(event.target as Node)
    );

    if (!isInside && !isInsideExcluded) {
      onOutsideClick(event);
    }
  }, [enabled, excludeRefs, onOutsideClick]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      // Remove event listeners
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [enabled, handleClick]);

  return ref;
};

// Utility hook for handling dropdown/modal closing
export const useCloseOnOutsideClick = (
  isOpen: boolean,
  onClose: () => void,
  excludeRefs: React.RefObject<HTMLElement>[] = []
) => {
  const ref = useOutsideClick({
    enabled: isOpen,
    excludeRefs,
    onOutsideClick: onClose
  });

  return ref;
};

export default useOutsideClick;