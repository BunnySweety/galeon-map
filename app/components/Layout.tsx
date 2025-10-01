// File: app/components/Layout.tsx
'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLingui } from '@lingui/react';
import logger from '../utils/logger';

// Dynamic imports for code splitting
const MapWrapperCDN = dynamic(() => import('./MapWrapperCDN'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ),
});

const SidebarFinal = dynamic(() => import('./SidebarFinal'), {
  ssr: false,
  loading: () => (
    <div className="w-[clamp(260px,18vw,320px)] h-full bg-slate-800/50 rounded-lg animate-pulse"></div>
  ),
});

const TimelineControl = dynamic(() => import('./TimelineControl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[clamp(120px,16vh,180px)] bg-slate-800/50 rounded-2xl animate-pulse"></div>
  ),
});

const ActionBar = dynamic(() => import('./ActionBar'), {
  ssr: false,
  loading: () => (
    <div className="w-[140px] h-[55px] bg-slate-800/50 rounded-xl animate-pulse"></div>
  ),
});

const Layout: React.FC = () => {
  const { i18n } = useLingui();

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

  return (
    // Main container: Use flex column, full height, hidden overflow
    <div className="w-full h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Visually hidden h1 for accessibility */}
      <h1 className="sr-only">{_('Galeon Community Hospital Map')}</h1>
      {/* Map Area: Relative for sidebar, grows but CAN shrink (min-h-0) */}
      <main className="relative flex-grow min-h-0">
        <MapWrapperCDN />

        {/* Sidebar */}
        <div className="absolute top-[var(--standard-spacing)] left-[var(--standard-spacing)] bottom-[var(--standard-spacing)] z-10 sidebar-position">
          <SidebarFinal />
        </div>
        {/* Timeline: Positioned absolutely by its own internal styles now */}
        <TimelineControl />
        {/* Action Bar: Centered on timeline area only */}
        <div
          className="absolute actionbar-top z-20 pointer-events-auto
                     left-[calc(var(--standard-spacing)*5+clamp(260px,18vw,320px))]
                     right-[var(--standard-spacing)]
                     flex justify-center"
        >
          <ActionBar />
        </div>

        {/* Credits: Centered on timeline area, aligned with sidebar bottom, compact design */}
        <div
          className="absolute z-10 pointer-events-auto
                     bottom-[var(--standard-spacing)]
                     left-[calc(var(--standard-spacing)*5+clamp(260px,18vw,320px))]
                     right-[var(--standard-spacing)]
                     flex justify-center"
        >
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '6px 10px',
              gap: '2px',
              height: '28px',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(17.5px)',
              WebkitBackdropFilter: 'blur(17.5px)',
              borderRadius: '6px',
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '11px',
                lineHeight: '14px',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                letterSpacing: '-0.15px',
                color: '#A1CBF9',
                flex: 'none',
                flexGrow: 0,
              }}
            >
              {_('Made with')}
            </span>
            <span
              style={{
                fontFamily: 'Arial',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '12px',
                lineHeight: '14px',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                letterSpacing: '-0.15px',
                color: '#479AF3',
                textShadow:
                  '0px 2px 8px rgba(71, 154, 243, 0.6), 0px 1px 4px rgba(71, 154, 243, 0.4)',
                flex: 'none',
                flexGrow: 0,
              }}
            >
              ♥
            </span>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '11px',
                lineHeight: '14px',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                letterSpacing: '-0.15px',
                color: '#A1CBF9',
                flex: 'none',
                flexGrow: 0,
              }}
            >
              {_('by')} BunnySweety
            </span>
          </div>
        </div>

        {/* Version: Coin bas-droit, design compact */}
        <div className="absolute right-[var(--standard-spacing)] bottom-[var(--standard-spacing)] z-10 pointer-events-auto">
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '6px 10px',
              gap: '2px',
              height: '28px',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(17.5px)',
              WebkitBackdropFilter: 'blur(17.5px)',
              borderRadius: '6px',
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '11px',
                lineHeight: '14px',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                letterSpacing: '-0.15px',
                color: '#A1CBF9',
                flex: 'none',
                flexGrow: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {process.env.NEXT_PUBLIC_APP_VERSION ?? 'v1.0.0'}
            </span>
          </div>
        </div>
      </main>{' '}
      {/* End Map Area */}
    </div> // End Main Container
  );
};

export default Layout;
