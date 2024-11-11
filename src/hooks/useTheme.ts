import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDarkMode } from '@/store/slices/uiSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.ui.darkMode);

  // Initialize theme based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      dispatch(setDarkMode(savedTheme === 'dark'));
    } else if (prefersDark) {
      dispatch(setDarkMode(true));
    }
  }, [dispatch]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if there's no saved preference
      if (!localStorage.getItem('theme')) {
        dispatch(setDarkMode(e.matches));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch]);

  // Update theme
  const toggleTheme = useCallback(() => {
    const newDarkMode = !isDarkMode;
    dispatch(setDarkMode(newDarkMode));
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Update document classes
    document.documentElement.classList.toggle('dark', newDarkMode);
  }, [isDarkMode, dispatch]);

  return {
    isDarkMode,
    toggleTheme
  };
};

export default useTheme;