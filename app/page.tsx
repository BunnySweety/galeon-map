// File: app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from './store/useMapStore';

// Import Layout with dynamic import to avoid SSR issues with MapBox
const Layout = dynamic(() => import('./components/Layout'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

// Loading animation component
const LoadingAnimation = () => {
  // Get the language from localStorage if available
  const getLanguage = () => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale');
      return savedLocale === 'fr' ? 'fr' : 'en';
    }
    return 'en';
  };
  
  const language = getLanguage();
  
  // Use the same translation keys as defined in the translation files
  const translations = {
    en: {
      'Loading application...': 'Loading application...',
      'HOSPITALS MAP': 'HOSPITALS MAP',
      'Galeon Logo': 'Galeon Logo'
    },
    fr: {
      'Loading application...': 'Chargement de l\'application...',
      'HOSPITALS MAP': 'CARTE DES HÔPITAUX',
      'Galeon Logo': 'Logo Galeon'
    }
  };
  
  // Function to get translated text using the same keys as in the translation files
  const t = (key: string) => {
    return translations[language as 'en' | 'fr'][key] || key;
  };
  
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-4">
          {/* Logo from SVG file */}
          {typeof window !== 'undefined' && (
            <img 
              src="/logo-white.svg" 
              alt={t('Galeon Logo')} 
              width={40} 
              height={40} 
              className="mr-3"
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
          <span className="text-3xl font-normal tracking-wide text-white font-[var(--font-minion)]">
            GALEON
          </span>
        </div>
        
        {/* Neon title effect for "HOSPITALS MAP" */}
        <h1 className="text-xl font-normal tracking-wide text-[#60a5fa] mb-5 text-center"
            style={{
              textShadow: "0 0 5px rgba(96, 165, 250, 0.7), 0 0 10px rgba(96, 165, 250, 0.5), 0 0 15px rgba(96, 165, 250, 0.3)"
            }}
        >
          {t('HOSPITALS MAP')}
        </h1>
        
        <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" 
               style={{ width: '60%', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-4 text-slate-400">{t('Loading application...')}</p>
      </div>
    </div>
  );
};

// Main application component with initialization logic
const AppWithInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const { initialize } = useMapStore();

  useEffect(() => {
    // Use setTimeout to avoid rendering issues
    const timer = setTimeout(async () => {
      try {
        await initialize();
        setInitialized(true);
      } catch (error) {
        // Get the language from localStorage if available
        const language = typeof window !== 'undefined' && localStorage.getItem('locale') === 'fr' ? 'fr' : 'en';
        const errorMessage = language === 'fr' ? 'Erreur d\'initialisation:' : 'Initialization error:';
        console.error(errorMessage, error);
        
        // Retry after a delay in case of failure
        setTimeout(async () => {
          try {
            await initialize();
            setInitialized(true);
          } catch (retryError) {
            const retryErrorMessage = language === 'fr' ? 'Échec lors de la réinitialisation:' : 'Retry initialization failed:';
            console.error(retryErrorMessage, retryError);
            // Initialize anyway to avoid blocking
            setInitialized(true);
          }
        }, 2000);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [initialize]);

  if (!initialized) {
    return <LoadingAnimation />;
  }

  return <Layout />;
};

// Main page component
export default function Home() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <AppWithInitialization />
    </Suspense>
  );
}