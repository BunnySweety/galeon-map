import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';

interface KeyboardOptions {
  enableEscapeKey?: boolean;
  enableArrowKeys?: boolean;
  enableSearchShortcut?: boolean;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}

export const useKeyboard = (options: KeyboardOptions = {}) => {
  const dispatch = useAppDispatch();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore key events when typing in input fields
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        if (options.enableEscapeKey !== false) {
          if (options.onEscape) {
            options.onEscape();
          } else {
            dispatch(toggleSidebar());
          }
        }
        break;

      case 'ArrowUp':
        if (options.enableArrowKeys && options.onArrowUp) {
          event.preventDefault();
          options.onArrowUp();
        }
        break;

      case 'ArrowDown':
        if (options.enableArrowKeys && options.onArrowDown) {
          event.preventDefault();
          options.onArrowDown();
        }
        break;

      case 'ArrowLeft':
        if (options.enableArrowKeys && options.onArrowLeft) {
          event.preventDefault();
          options.onArrowLeft();
        }
        break;

      case 'ArrowRight':
        if (options.enableArrowKeys && options.onArrowRight) {
          event.preventDefault();
          options.onArrowRight();
        }
        break;

      // Search shortcut (Ctrl/Cmd + K)
      case 'k':
        if (options.enableSearchShortcut && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('#search-input');
          searchInput?.focus();
        }
        break;
    }
  }, [dispatch, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboard;