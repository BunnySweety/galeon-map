// File: app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import { activateLocale, initI18n, LocaleType } from './i18n';
import { useMapStore } from './store/useMapStore';
import logger from './utils/logger';
import QueryProviderWrapper from './components/QueryProviderWrapper';

interface ProvidersProps {
  children: ReactNode;
  enableQuery?: boolean;
}

export function Providers({ children, enableQuery = false }: ProvidersProps) {
  return (
    <QueryProviderWrapper enableQuery={enableQuery}>
      <I18nProviderWrapper>{children}</I18nProviderWrapper>
    </QueryProviderWrapper>
  );
}

interface I18nProviderWrapperProps {
  children: ReactNode;
}

export function I18nProviderWrapper({ children }: I18nProviderWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { setLanguage } = useMapStore();

  useEffect(() => {
    // Get locale from cookies or localStorage
    const getInitialLocale = (): LocaleType => {
      // Check localStorage first
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('locale') as LocaleType | null;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
          return savedLocale;
        }
      }

      // Check cookies
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] as LocaleType | undefined;

      if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'fr')) {
        return cookieLocale;
      }

      // Use default language
      return 'en';
    };

    const initLocale = async () => {
      try {
        // Initialize i18n first
        await initI18n();

        // Then activate the initial locale
        const initialLocale = getInitialLocale();
        await activateLocale(initialLocale);

        // Update the store
        setLanguage(initialLocale);

        // Mark as loaded
        setIsLoaded(true);

        logger.debug(`I18nProviderWrapper: Initialized with locale ${initialLocale}`);
      } catch (error) {
        logger.error('Failed to initialize locale:', error);
        // Fallback to English if initialization fails
        await activateLocale('en');
        setLanguage('en');
        setIsLoaded(true);
      }
    };

    initLocale();
  }, [setLanguage]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
