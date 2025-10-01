// File: app/components/map/MapControls.tsx
'use client';

import { useCallback } from 'react';
import screenfull from 'screenfull';

// Icons Components
const LocationIcon: React.FC<{ isLocating?: boolean }> = ({ isLocating = false }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="#A1CBF9"
      strokeWidth="2"
      className={isLocating ? 'animate-pulse' : ''}
    ></circle>
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="#A1CBF9"
      className={isLocating ? 'animate-ping' : ''}
    ></circle>
    <path d="M12 2V4" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M12 20V22" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M2 12L4 12" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M20 12L22 12" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
  </svg>
);

const FullscreenEnterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1CBF9" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    <circle cx="12" cy="12" r="1" fill="#A1CBF9" />
  </svg>
);

const FullscreenExitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1CBF9" strokeWidth="2">
    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M8 21v-3a2 2 0 0 0-2-2H3" />
    <rect x="10" y="10" width="4" height="4" fill="#A1CBF9" />
  </svg>
);

const FullscreenIcon: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
  return isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />;
};

// Props interface
interface MapControlsProps {
  isLocating: boolean;
  isFullscreen: boolean;
  isMobileView: boolean;
  onLocationClick: () => void;
  onFullscreenToggle: () => void;
  getLocationTooltip: () => string;
  getFullscreenTooltip: () => string;
  mapRootContainer: React.RefObject<HTMLDivElement | null>;
}

const MapControls: React.FC<MapControlsProps> = ({
  isLocating,
  isFullscreen,
  isMobileView,
  onLocationClick,
  onFullscreenToggle,
  getLocationTooltip,
  getFullscreenTooltip,
  mapRootContainer,
}) => {
  const handleFullscreenToggle = useCallback(() => {
    if (screenfull.isEnabled && mapRootContainer.current) {
      screenfull.toggle(mapRootContainer.current);
    } else {
      onFullscreenToggle();
    }
  }, [mapRootContainer, onFullscreenToggle]);

  // Calculate button position based on fullscreen and mobile state
  const getButtonPosition = () => {
    if (isFullscreen) {
      return 'top-24'; // Position plus basse en plein écran
    }
    return isMobileView ? 'top-32' : 'top-44';
  };

  const buttonBaseStyle = {
    width: 'clamp(45px, 5vw, 55px)',
    height: 'clamp(45px, 5vw, 55px)',
    padding: 'calc(var(--standard-spacing) * 0.4)',
    background: 'rgba(217, 217, 217, 0.05)',
    border: '1.95px solid rgba(71,154,243,0.3)',
    backdropFilter: 'blur(17.5px)',
    borderRadius: '16px',
    cursor: 'pointer',
    margin: 'calc(var(--standard-spacing) * 0.4) 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    touchAction: 'manipulation' as const,
  };

  return (
    <div
      className={`absolute ${isMobileView ? 'right-2' : 'right-6'} ${
        isFullscreen ? 'z-[9999]' : 'z-[60]'
      } flex flex-col ${getButtonPosition()}`}
      style={{
        gap: '4px', // Espacement réduit entre les boutons
      }}
    >
      {/* Location Button */}
      <button
        onClick={onLocationClick}
        className="map-control-button touch-manipulation hover:bg-white/20 transition-colors"
        style={buttonBaseStyle}
        aria-label="Show my location"
        title={getLocationTooltip()}
      >
        <LocationIcon isLocating={isLocating} />
      </button>

      {/* Fullscreen Button */}
      {screenfull.isEnabled && (
        <button
          key={`fullscreen-${isFullscreen}`} // Forcer le re-rendu avec une clé unique
          onClick={handleFullscreenToggle}
          className="map-control-button touch-manipulation hover:bg-white/20 transition-colors"
          style={buttonBaseStyle}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={getFullscreenTooltip()}
        >
          <FullscreenIcon isFullscreen={isFullscreen} />
        </button>
      )}
    </div>
  );
};

export default MapControls;
