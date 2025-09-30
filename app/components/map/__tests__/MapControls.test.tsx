// File: app/components/map/__tests__/MapControls.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import MapControls from '../MapControls';

// Mock screenfull
const mockScreenfull = {
  isEnabled: true,
  toggle: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isFullscreen: false,
};

vi.mock('screenfull', () => ({
  default: mockScreenfull,
}));

describe('MapControls', () => {
  const defaultProps = {
    isLocating: false,
    isFullscreen: false,
    isMobileView: false,
    onLocationClick: vi.fn(),
    onFullscreenToggle: vi.fn(),
    getLocationTooltip: vi.fn(() => 'Geolocate'),
    getFullscreenTooltip: vi.fn(() => 'Enter fullscreen'),
    mapRootContainer: createRef<HTMLDivElement>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render location button', () => {
    render(<MapControls {...defaultProps} />);
    
    const locationButton = screen.getByRole('button', { name: /show my location/i });
    expect(locationButton).toBeInTheDocument();
  });

  it('should render fullscreen button when screenfull is enabled', () => {
    mockScreenfull.isEnabled = true;
    
    render(<MapControls {...defaultProps} />);
    
    const fullscreenButton = screen.getByRole('button', { name: /enter fullscreen/i });
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('should not render fullscreen button when screenfull is disabled', () => {
    mockScreenfull.isEnabled = false;
    
    render(<MapControls {...defaultProps} />);
    
    const fullscreenButton = screen.queryByRole('button', { name: /enter fullscreen/i });
    expect(fullscreenButton).not.toBeInTheDocument();
  });

  it('should call onLocationClick when location button is clicked', () => {
    render(<MapControls {...defaultProps} />);
    
    const locationButton = screen.getByRole('button', { name: /show my location/i });
    fireEvent.click(locationButton);
    
    expect(defaultProps.onLocationClick).toHaveBeenCalledTimes(1);
  });

  it('should call screenfull.toggle when fullscreen button is clicked', () => {
    mockScreenfull.isEnabled = true;
    const mapRootContainer = createRef<HTMLDivElement>();
    // Mock current to have a div element
    (mapRootContainer as any).current = document.createElement('div');
    
    render(<MapControls {...defaultProps} mapRootContainer={mapRootContainer} />);
    
    const fullscreenButton = screen.getByRole('button', { name: /enter fullscreen/i });
    fireEvent.click(fullscreenButton);
    
    expect(mockScreenfull.toggle).toHaveBeenCalledWith(mapRootContainer.current);
  });

  it('should show correct position for mobile view', () => {
    render(<MapControls {...defaultProps} isMobileView={true} />);
    
    const controlsContainer = screen.getByRole('button', { name: /show my location/i }).parentElement;
    expect(controlsContainer).toHaveClass('right-2', 'top-32');
  });

  it('should show correct position for desktop view', () => {
    render(<MapControls {...defaultProps} isMobileView={false} />);
    
    const controlsContainer = screen.getByRole('button', { name: /show my location/i }).parentElement;
    expect(controlsContainer).toHaveClass('right-6', 'top-44');
  });

  it('should show correct position for fullscreen mode', () => {
    render(<MapControls {...defaultProps} isFullscreen={true} />);
    
    const controlsContainer = screen.getByRole('button', { name: /show my location/i }).parentElement;
    expect(controlsContainer).toHaveClass('top-24');
  });

  it('should show different icon when locating', () => {
    const { rerender } = render(<MapControls {...defaultProps} isLocating={false} />);
    
    let locationIcon = screen.getByRole('button', { name: /show my location/i }).querySelector('svg');
    expect(locationIcon?.querySelector('.animate-pulse')).toBeNull();
    
    rerender(<MapControls {...defaultProps} isLocating={true} />);
    
    locationIcon = screen.getByRole('button', { name: /show my location/i }).querySelector('svg');
    expect(locationIcon?.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should show different fullscreen icon based on state', () => {
    mockScreenfull.isEnabled = true;
    
    const { rerender } = render(<MapControls {...defaultProps} isFullscreen={false} />);
    
    let fullscreenButton = screen.getByRole('button', { name: /enter fullscreen/i });
    expect(fullscreenButton).toBeInTheDocument();
    
    rerender(<MapControls {...defaultProps} isFullscreen={true} getFullscreenTooltip={() => 'Exit fullscreen'} />);
    
    fullscreenButton = screen.getByRole('button', { name: /exit fullscreen/i });
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('should apply correct z-index for fullscreen mode', () => {
    const { rerender } = render(<MapControls {...defaultProps} isFullscreen={false} />);
    
    let controlsContainer = screen.getByRole('button', { name: /show my location/i }).parentElement;
    expect(controlsContainer).toHaveClass('z-[60]');
    
    rerender(<MapControls {...defaultProps} isFullscreen={true} />);
    
    controlsContainer = screen.getByRole('button', { name: /show my location/i }).parentElement;
    expect(controlsContainer).toHaveClass('z-[9999]');
  });
});
