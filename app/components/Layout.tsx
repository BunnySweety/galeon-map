// File: app/components/Layout.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLingui } from '@lingui/react';
import logger from '../utils/logger';
import Sidebar from './Sidebar';
import TimelineControl from './TimelineControl';
import ActionBar from './ActionBar';

const MapWrapperCDN = dynamic(() => import('./MapWrapperCDN'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
});

const MobileLayout = dynamic(() => import('./MobileLayout'), {
  ssr: false,
});

const Layout: React.FC = () => {
  const { i18n } = useLingui();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const _ = useCallback(
    (text: string) => {
      try {
        if (!i18n?._) return text;
        return i18n._(text);
      } catch (error) {
        logger.error(`Error translating text in Layout component: ${text}`, error);
        return text;
      }
    },
    [i18n]
  );

  useEffect(() => {
    /* Initialization */
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialized(true);
      } catch (error) {
        logger.error('Initialization failed', error);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    /* Resize Detection */
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobileView(width < 768 || height < 500);
      setSidebarVisible(width >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Utiliser la version mobile pour les petits écrans
  if (isMobileView) {
    return <MobileLayout />;
  }

  return (
    // Main container: Use flex column, full height, hidden overflow
    <div className="w-full h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Map Area: Relative for sidebar, grows but CAN shrink (min-h-0) */}
      <div className="relative flex-grow min-h-0">
        <MapWrapperCDN /> {/* Removed isMobileView prop */}
        {/* Mobile toggle button for sidebar - Discret et petit */}
        {isMobileView && (
          <button
            className="absolute top-[var(--standard-spacing)] left-[var(--standard-spacing)] z-20 sidebar-toggle-button"
            onClick={toggleSidebar}
            aria-label={sidebarVisible ? _('Hide sidebar') : _('Show sidebar')}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              padding: '10px',
              background: 'rgba(217, 217, 217, 0.06)',
              border: '1.5px solid rgba(71, 154, 243, 0.3)',
              backdropFilter: 'blur(12px)',
              borderRadius: '10px',
              touchAction: 'manipulation',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: '0.85',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.85';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
                          <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
              {sidebarVisible ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
        {/* Sidebar */}
        <div
          className={`absolute top-[var(--standard-spacing)] left-[var(--standard-spacing)] bottom-0 z-10 transition-transform duration-300 ${isMobileView && !sidebarVisible ? '-translate-x-full' : 'translate-x-0'} sidebar-position`}
        >
          <Sidebar />
        </div>
        {/* Timeline: Positioned absolutely by its own internal styles now */}
        <TimelineControl />
        {/* Action Bar: Positioned absolutely below the estimated timeline position, centered under the timeline */}
        <div
          className={`
            absolute actionbar-top z-20 pointer-events-auto
            ${
              isMobileView
                ? 'left-[var(--standard-spacing)] right-[var(--standard-spacing)] flex justify-center'
                : 'left-[calc(var(--standard-spacing)*2+clamp(280px,22vw,340px))] right-[var(--standard-spacing)] flex justify-center'
            }
          `}
        >
          <ActionBar />
        </div>
      </div>{' '}
      {/* End Map Area */}
      {/* Footer Container (Credits/Version Only): Remains at bottom, outside Map Area */}
      <div className="relative flex-shrink-0 px-[var(--standard-spacing)] pb-[var(--standard-spacing)] h-[var(--standard-spacing)] z-40 pointer-events-none">
        {/* Credits: Centered under the timeline, same left/right as timeline/action bar */}
        <div
          className={`
            absolute z-10 pointer-events-auto
            bottom-[var(--standard-spacing)]
            ${
              isMobileView
                ? 'left-[var(--standard-spacing)] right-[var(--standard-spacing)] flex justify-center'
                : 'left-[calc(var(--standard-spacing)*2+clamp(280px,22vw,340px))] right-[var(--standard-spacing)] flex justify-center'
            }
          `}
        >
          <div className="pointer-events-auto">
            <div className="w-[110px] md:w-[140px] flex justify-center">
              <div className="border-2 border-[rgba(71,154,243,0.3)] rounded-lg px-3 sm:px-4 py-1 sm:py-2 bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] text-[#A1CBF9] text-[clamp(10px,0.8vw,13px)] transition-all duration-200 whitespace-nowrap inline-block">
                {_('Made with')} <span className="text-[#3b82f6]"> ♥ </span>
                {_('by')} BunnySweety
              </div>
            </div>
          </div>
        </div>

        {/* Absolutely positioned Version */}
        <div className="absolute right-[var(--standard-spacing)] bottom-[var(--standard-spacing)] pointer-events-auto">
          <div className="border-2 border-[rgba(71,154,243,0.3)] rounded-lg px-3 sm:px-4 py-1 sm:py-2 bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] text-[#A1CBF9] text-[clamp(10px,0.8vw,13px)] transition-all duration-200 whitespace-nowrap inline-block">
            {process.env.NEXT_PUBLIC_APP_VERSION ?? 'v1.0.0'}
          </div>
        </div>
      </div>{' '}
      {/* End Footer Container */}
    </div> // End Main Container
  );
};

export default Layout;
