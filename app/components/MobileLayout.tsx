'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLingui } from '@lingui/react';
import logger from '../utils/logger';
import { useMapStore } from '../store/useMapStore';
import { LocaleType } from '../i18n';
import Image from 'next/image';

// Import des composants optimisés pour mobile
const MapWrapperCDN = dynamic(() => import('./MapWrapperCDN'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
});

// Composant Timeline mobile simplifié
const MobileTimeline = dynamic(() => import('./MobileTimeline'), {
  ssr: false,
});

// Composant Sidebar mobile en overlay
const MobileSidebar = dynamic(() => import('./MobileSidebar'), {
  ssr: false,
});

// Composant ActionBar mobile
const MobileActionBar = dynamic(() => import('./MobileActionBar'), {
  ssr: false,
});

const MobileLayout: React.FC = () => {
  const { i18n } = useLingui();
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(true);
  const [actionBarVisible, setActionBarVisible] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  const { language, setLanguage } = useMapStore();

  const _ = useCallback(
    (text: string) => {
      try {
        if (!i18n?._) return text;
        return i18n._(text);
      } catch (error) {
        logger.error(`Error translating text in MobileLayout: ${text}`, error);
        return text;
      }
    },
    [i18n]
  );

  // Initialisation
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsInitialized(true);
      } catch (error) {
        logger.error('Mobile initialization failed', error);
      }
    };
    initializeApp();
  }, []);

  // Détection d'orientation et redimensionnement
  useEffect(() => {
    const handleOrientationChange = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsPortrait(height > width);
      
      // Fermer la sidebar automatiquement en mode paysage
      if (width > height && sidebarVisible) {
        setSidebarVisible(false);
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [sidebarVisible]);

  // Gestion des langues
  const handleLanguageChange = useCallback((newLanguage: LocaleType) => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
    }
  }, [language, setLanguage]);

  // Handlers pour les toggles
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
    // Fermer les autres panneaux quand on ouvre la sidebar
    if (!sidebarVisible) {
      setActionBarVisible(false);
    }
  }, [sidebarVisible]);

  const toggleActionBar = useCallback(() => {
    setActionBarVisible(!actionBarVisible);
    // Fermer les autres panneaux quand on ouvre l'action bar
    if (!actionBarVisible) {
      setSidebarVisible(false);
    }
  }, [actionBarVisible]);

  const toggleTimeline = useCallback(() => {
    setTimelineVisible(!timelineVisible);
  }, [timelineVisible]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">{_('Loading Mobile Interface')}</h2>
          <p className="text-gray-300">{_('Optimizing for your device...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col overflow-hidden relative">
      {/* Carte - Prend tout l'espace */}
      <div className="relative flex-1 w-full h-full">
        <MapWrapperCDN />
        
        {/* Overlay sombre quand sidebar/actionbar ouvert */}
        {(sidebarVisible || actionBarVisible) && (
          <div 
            className="absolute inset-0 bg-black/50 z-30 transition-opacity duration-300"
            onClick={() => {
              setSidebarVisible(false);
              setActionBarVisible(false);
            }}
          />
        )}

        {/* Barre de contrôle supérieure */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4">
          <div className="flex justify-between items-center">
            {/* Bouton Menu/Sidebar */}
            <button
              onClick={toggleSidebar}
              className="mobile-control-btn"
              aria-label={sidebarVisible ? _('Close menu') : _('Open menu')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarVisible ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo GALEON centré et discret */}
            <div className="flex items-center opacity-40 transition-opacity duration-300">
              <Image
                src="/logo-white.svg"
                alt={_('Galeon Logo')}
                width={20}
                height={20}
                className="mr-1.5"
                style={{ width: 'auto', height: 'auto', minWidth: '20px', minHeight: '20px' }}
              />
              <span className="text-white text-sm font-medium tracking-wide">
                GALEON
              </span>
            </div>

            {/* Bouton Actions */}
            <button
              onClick={toggleActionBar}
              className="mobile-control-btn"
              aria-label={actionBarVisible ? _('Close actions') : _('Open actions')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timeline - Position adaptative */}
        {timelineVisible && (
          <div className={`absolute z-20 left-4 right-4 transition-all duration-300 ${
            isPortrait ? 'bottom-24' : 'bottom-20'
          }`}>
            <MobileTimeline />
          </div>
        )}

        {/* Languette discrète pour contrôler la timeline */}
        <div className={`absolute z-30 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
          isPortrait ? 'bottom-4' : 'bottom-4'
        }`}>
          <button
            onClick={toggleTimeline}
            className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1 text-white/70 hover:text-white/90 hover:bg-black/40 transition-all duration-200"
            aria-label={timelineVisible ? _('Hide timeline') : _('Show timeline')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {timelineVisible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              )}
            </svg>
            <span className="text-xs font-medium">
              {timelineVisible ? _('Hide') : _('Timeline')}
            </span>
          </button>
        </div>

        {/* Sidebar mobile */}
        <MobileSidebar 
          isVisible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onLanguageChange={handleLanguageChange}
        />

        {/* ActionBar mobile */}
        <MobileActionBar 
          isVisible={actionBarVisible}
          onClose={() => setActionBarVisible(false)}
        />
      </div>

      {/* Footer minimal */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2">
        <div className="flex justify-center items-center text-xs text-gray-400">
          <span>{_('Made with')} ♥ {_('by')} BunnySweety</span>
          <span className="mx-2">•</span>
          <span>v{process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0'}</span>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout; 