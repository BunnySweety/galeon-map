// File: app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useEffect, useState } from 'react';
import { activateLocale, LocaleType } from './i18n';
import { useMapStore } from './store/useMapStore';

interface I18nProviderWrapperProps {
  children: ReactNode;
}

export function I18nProviderWrapper({ children }: I18nProviderWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { setLanguage } = useMapStore();

  useEffect(() => {
    // Récupérer la locale depuis les cookies ou localStorage
    const getInitialLocale = (): LocaleType => {
      // Vérifier localStorage d'abord
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('locale') as LocaleType | null;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
          return savedLocale;
        }
      }

      // Vérifier les cookies
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] as LocaleType | undefined;

      if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'fr')) {
        return cookieLocale;
      }

      // Utiliser la langue par défaut
      return 'en';
    };

    const initLocale = async () => {
      const initialLocale = getInitialLocale();
      await activateLocale(initialLocale);
      setLanguage(initialLocale);
      setIsLoaded(true);
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