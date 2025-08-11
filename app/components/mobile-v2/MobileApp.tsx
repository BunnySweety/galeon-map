'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { MobileProvider } from './MobileProvider';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy loading des composants lourds
const MobileMap = lazy(() => import('./MobileMap'));
const MobileHospitalList = lazy(() => import('./MobileHospitalList'));
const MobileTimeline = lazy(() => import('./MobileTimeline'));
const MobileSettings = lazy(() => import('./MobileSettings'));

type ViewType = 'map' | 'list' | 'timeline' | 'settings';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

export default function MobileApp() {
  const [activeView, setActiveView] = useState<ViewType>('map');
  const [isOffline, setIsOffline] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Détection mode offline
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isMobile) {
    // Rediriger vers la version desktop si pas mobile
    return null;
  }

  return (
    <MobileProvider>
      <div className="mobile-app h-screen w-full flex flex-col bg-gray-900 overflow-hidden">
        {/* Header */}
        <MobileHeader isOffline={isOffline} />
        
        {/* Main Content Area avec animations */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Suspense fallback={<LoadingSpinner />}>
                {activeView === 'map' && <MobileMap />}
                {activeView === 'list' && <MobileHospitalList />}
                {activeView === 'timeline' && <MobileTimeline />}
                {activeView === 'settings' && <MobileSettings />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNav 
          activeView={activeView} 
          onViewChange={setActiveView}
        />
      </div>
    </MobileProvider>
  );
}
