// File: app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

// Create a client with persistent caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1, // Réduire le nombre de tentatives en cas d'échec
      gcTime: 10 * 60 * 1000, // Anciennement 'cacheTime' dans les versions précédentes
    },
  },
});

// Loading animation component
const LoadingAnimation = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold text-white mb-4 flex items-center">
        <span className="mr-2">Ω</span>
        <span>GALEON</span>
      </div>
      <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse" 
             style={{ width: '60%', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-slate-400">Chargement de l'application...</p>
    </div>
  </div>
);

// Main application component with initialization logic
const AppWithInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const { initialize } = useMapStore();

  useEffect(() => {
    // Utiliser setTimeout pour éviter les problèmes de rendu
    const timer = setTimeout(async () => {
      try {
        await initialize();
        setInitialized(true);
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        // Réessayer après un délai en cas d'échec
        setTimeout(async () => {
          try {
            await initialize();
            setInitialized(true);
          } catch (retryError) {
            console.error('Échec lors de la réinitialisation:', retryError);
            // Initialiser quand même pour éviter un blocage
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
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingAnimation />}>
        <AppWithInitialization />
      </Suspense>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}