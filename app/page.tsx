// File: app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dynamic from 'next/dynamic';
import { useMapStore } from './store/useMapStore';
import { hospitals } from './api/hospitals/data';

const Layout = dynamic(() => import('./components/Layout'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      gcTime: 10 * 60 * 1000,
    },
  },
});

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

const AppWithInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const { setHospitals, applyFilters } = useMapStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setHospitals(hospitals);
        applyFilters();
        setInitialized(true);
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setInitialized(true);
      }
    };

    initializeApp();
  }, [setHospitals, applyFilters]);

  if (!initialized) {
    return <LoadingAnimation />;
  }

  return <Layout />;
};

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