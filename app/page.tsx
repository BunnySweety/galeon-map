// File: app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMapStore } from './store/useMapStore';
import { initPerformanceMonitoring } from './utils/performance';
import { initializeCriticalOptimizations } from './utils/critical-css';
import { initializeResourceHints } from './utils/resource-hints';
import { FontOptimizer } from './utils/font-optimization';
import { BundleAnalyzer } from './utils/bundle-analyzer';
import { initializeRateLimiting } from './utils/rate-limiter';
import { initializePredictiveCache } from './utils/cache-optimizer';
import { initializeValidation } from './utils/optimization-validator';
import { initializeResponsivenessTests } from './utils/responsiveness-tester';
import { initResourceFixes } from './utils/fix-resource-loading';
import logger from './utils/logger';

// Import OptimizedLayout with dynamic import to avoid SSR issues with MapBox
// This will automatically detect mobile and load the appropriate version
const OptimizedLayout = dynamic(() => import('./components/OptimizedLayout'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
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
      'Galeon Logo': 'Galeon Logo',
      'Galeon Hospitals Map': 'Galeon Hospitals Map',
    },
    fr: {
      'Loading application...': "Chargement de l'application...",
      'HOSPITALS MAP': 'CARTE DES HÔPITAUX',
      'Galeon Logo': 'Logo Galeon',
      'Galeon Hospitals Map': 'Carte des Hôpitaux Galeon',
    },
  } as const;

  // Function to get translated text using the same keys as in the translation files
  const t = (key: keyof typeof translations.en) => {
    return translations[language as 'en' | 'fr'][key] || key;
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-4">
          {/* Logo from SVG file */}
          {typeof window !== 'undefined' && (
            <Image
              src="/logo-white.svg"
              alt={t('Galeon Logo')}
              width={40}
              height={40}
              className="mr-2"
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
          <h1 className="text-2xl font-bold text-white">{t('Galeon Hospitals Map')}</h1>
        </div>

        {/* Neon title effect for "HOSPITALS MAP" */}
        <h1
          className="text-xl font-normal tracking-wide text-[#60a5fa] mb-5 text-center"
          style={{
            textShadow:
              '0 0 5px rgba(96, 165, 250, 0.7), 0 0 10px rgba(96, 165, 250, 0.5), 0 0 15px rgba(96, 165, 250, 0.3)',
          }}
        >
          {t('HOSPITALS MAP')}
        </h1>

        <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 animate-pulse"
            style={{ width: '60%', animationDuration: '1.5s' }}
          ></div>
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
    // Phase 8: Nouvelles optimisations sécurité et performance
    const initializePhase8 = async () => {
      try {
        // 0. Corriger les problèmes de chargement de ressources (dev uniquement)
        if (process.env.NODE_ENV === 'development') {
          initResourceFixes();
        }
        
        // 1. Optimisations critiques (Phase 6)
        initializeCriticalOptimizations();
        initializeResourceHints();
        
        // 2. Optimisations polices et bundle (Phase 7)
        FontOptimizer.initialize();
        BundleAnalyzer.initialize();
        
        // 3. Monitoring performance (Phase 5-7)
        initPerformanceMonitoring();
        
        // 4. NOUVEAU - Phase 8: Sécurité et cache avancé
        initializeRateLimiting();
        initializePredictiveCache();
        
        // 5. Validation automatique des optimisations
        initializeValidation();
        
        // 6. Tests de responsivité automatiques
        initializeResponsivenessTests();
        
        if (process.env.NODE_ENV === 'development') {
          logger.info('🚀 Phase 8 optimizations initialized');
          logger.info('🛡️ Security: Rate limiting active');
          logger.info('🔮 Performance: Predictive cache active');
          logger.info('🔍 Validation: Automatic optimization testing active');
          logger.info('📱 Responsiveness: Automatic responsive testing active');
        }
        
      } catch (error) {
        logger.error('Phase 8 initialization error:', error);
      }
    };

    // Initialiser Phase 8 en premier
    initializePhase8();
    
    // Use setTimeout to avoid rendering issues
    const timer = setTimeout(async () => {
      try {
        await initialize();
        setInitialized(true);
      } catch (error) {
        // Get the language from localStorage if available
        const language =
          typeof window !== 'undefined' && localStorage.getItem('locale') === 'fr' ? 'fr' : 'en';
        const errorMessage =
          language === 'fr' ? "Erreur d'initialisation:" : 'Initialization error:';
        logger.error(errorMessage, error);

        // Retry after a delay in case of failure
        setTimeout(async () => {
          try {
            await initialize();
            setInitialized(true);
          } catch (retryError) {
            const retryErrorMessage =
              language === 'fr'
                ? 'Échec lors de la réinitialisation:'
                : 'Retry initialization failed:';
            logger.error(retryErrorMessage, retryError);
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

  return <OptimizedLayout />;
};

// Main page component
export default function Home() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <AppWithInitialization />
    </Suspense>
  );
}
