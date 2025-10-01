// File: app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from './store/useMapStore';
import { initPerformanceMonitoring } from './utils/performance';
import logger from './utils/logger';

// Import Layout with dynamic import to avoid SSR issues with MapBox
const Layout = dynamic(() => import('./components/Layout'), {
  ssr: false,
  loading: () => <SimpleLoader />,
});

// Simple loading component
const SimpleLoader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

// Main application component with initialization logic
const AppWithInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const { initialize } = useMapStore();

  useEffect(() => {
    // Simplified optimizations initialization
    const initializeOptimizations = async () => {
      try {
        // Only initialize essential performance monitoring
        if (typeof window !== 'undefined') {
          initPerformanceMonitoring();

          if (process.env.NODE_ENV === 'development') {
            logger.info('🚀 Essential optimizations initialized');
            logger.info('📊 Performance monitoring active');
          }
        }
      } catch (error) {
        logger.error('Optimization initialization error:', error);
      }
    };

    // Initialize optimizations
    initializeOptimizations();

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
    return <SimpleLoader />;
  }

  return <Layout />;
};

// Main page component
export default function Home() {
  return (
    <Suspense fallback={<SimpleLoader />}>
      <AppWithInitialization />
    </Suspense>
  );
}
