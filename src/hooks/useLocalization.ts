import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/uiSlice';

export const useLocalization = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(state => state.ui.language);

  const changeLanguage = useCallback(async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      dispatch(setLanguage(language));
      
      // Save preference to localStorage
      localStorage.setItem('preferred-language', language);
      
      // Update document attributes
      document.documentElement.lang = language;
      document.documentElement.dir = ['ar', 'fa', 'ur'].includes(language) ? 'rtl' : 'ltr';
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n, dispatch]);

  // Get available languages
  const availableLanguages = Object.keys(i18n.store.data).map(code => ({
    code,
    name: t(`languages.${code}`)
  }));

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    t
  };
};

export default useLocalization;