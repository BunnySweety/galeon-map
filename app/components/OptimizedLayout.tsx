'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMediaQuery } from '../hooks/useMediaQuery';

// Lazy loading des layouts
const DesktopLayout = dynamic(() => import('./Layout'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const MobileAppV2 = dynamic(() => import('./mobile-v2/MobileApp'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const LegacyMobileLayout = dynamic(() => import('./MobileLayout'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// Composant de chargement
function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Galeon Hospitals Map</h2>
        <p className="text-gray-400">Chargement optimisé...</p>
      </div>
    </div>
  );
}

interface OptimizedLayoutProps {
  forceMobileV2?: boolean; // Pour forcer la nouvelle version mobile en test
  useLegacyMobile?: boolean; // Pour utiliser l'ancienne version mobile
}

export default function OptimizedLayout({ 
  forceMobileV2 = false, 
  useLegacyMobile = false 
}: OptimizedLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const [useNewMobile, setUseNewMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Détection des capacités pour décider quelle version mobile utiliser
    if (typeof window !== 'undefined') {
      const hasGoodPerformance = checkDevicePerformance();
      const supportsModernFeatures = checkModernFeatures();
      
      // Utiliser la nouvelle version mobile si :
      // 1. Forcé par les props
      // 2. L'appareil a de bonnes performances et supporte les fonctionnalités modernes
      // 3. L'utilisateur a choisi la nouvelle version (stocké dans localStorage)
      const preferNewVersion = localStorage.getItem('preferMobileV2') === 'true';
      
      setUseNewMobile(
        forceMobileV2 || 
        (!useLegacyMobile && (preferNewVersion || (hasGoodPerformance && supportsModernFeatures)))
      );
    }
  }, [forceMobileV2, useLegacyMobile]);

  // Vérifier les performances de l'appareil
  function checkDevicePerformance(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Vérifier la mémoire disponible
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) return false;
    
    // Vérifier le nombre de cœurs CPU
    const cores = navigator.hardwareConcurrency;
    if (cores && cores < 4) return false;
    
    // Vérifier la connexion réseau
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
    }
    
    return true;
  }

  // Vérifier le support des fonctionnalités modernes
  function checkModernFeatures(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Vérifier le support de CSS Grid
    const supportsGrid = CSS.supports('display', 'grid');
    
    // Vérifier le support de Intersection Observer
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    
    // Vérifier le support de ResizeObserver
    const supportsResizeObserver = 'ResizeObserver' in window;
    
    // Vérifier le support de Web Animations API
    const supportsWebAnimations = 'animate' in Element.prototype;
    
    return supportsGrid && supportsIntersectionObserver && 
           supportsResizeObserver && supportsWebAnimations;
  }

  // Ne pas rendre côté serveur
  if (!mounted) {
    return <LoadingScreen />;
  }

  // Logique de sélection du layout
  if (isMobile) {
    if (useNewMobile && !useLegacyMobile) {
      return <MobileAppV2 />;
    } else {
      return <LegacyMobileLayout />;
    }
  }

  // Pour tablette, on peut utiliser une version adaptée du desktop
  if (isTablet) {
    return <DesktopLayout />;
  }

  // Desktop par défaut
  return <DesktopLayout />;
}
