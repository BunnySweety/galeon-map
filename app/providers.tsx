// File: app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import { activateLocale, initI18n, LocaleType } from './i18n';
import { useMapStore } from './store/useMapStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProviderWrapper>
        {children}
      </I18nProviderWrapper>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
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
        
        console.log(`I18nProviderWrapper: Initialized with locale ${initialLocale}`);
      } catch (error) {
        console.error('Failed to initialize locale:', error);
        // Fallback to English if initialization fails
        await activateLocale('en');
        setLanguage('en');
        setIsLoaded(true);
      }
    };

    initLocale();
  }, [setLanguage]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  );
}