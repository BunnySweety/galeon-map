'use client';

import { useCallback } from 'react';
import { useLingui } from '@lingui/react';

interface MobileMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGeolocation: () => void;
  hospitalCount: number;
}

export default function MobileMapControls({ 
  onZoomIn, 
  onZoomOut, 
  onGeolocation,
  hospitalCount 
}: MobileMapControlsProps) {
  const { i18n } = useLingui();

  const _ = useCallback(
    (text: string) => {
      try {
        return i18n?._ ? i18n._(text) : text;
      } catch {
        return text;
      }
    },
    [i18n]
  );

  return (
    <>
      {/* Stats Overlay - En haut à gauche */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-slate-700/50">
          <p className="text-white text-sm font-medium">
            {hospitalCount} {_('hospitals')}
          </p>
        </div>
      </div>

      {/* Contrôles de zoom - En bas à droite, au-dessus de la navigation */}
      <div className="absolute bottom-24 right-4 flex flex-col space-y-2 z-20">
        <button
          onClick={onZoomIn}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg text-white hover:bg-slate-700/90 transition-colors shadow-lg border border-slate-700/50"
          aria-label={_('Zoom in')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={onZoomOut}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg text-white hover:bg-slate-700/90 transition-colors shadow-lg border border-slate-700/50"
          aria-label={_('Zoom out')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Bouton Géolocalisation - En bas à gauche */}
      <div className="absolute bottom-24 left-4 z-20">
        <button
          onClick={onGeolocation}
          className="p-3 bg-slate-800/90 backdrop-blur-md rounded-lg text-white hover:bg-slate-700/90 transition-colors shadow-lg border border-slate-700/50"
          aria-label={_('My location')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </>
  );
}
