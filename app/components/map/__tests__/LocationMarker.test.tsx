// File: app/components/map/__tests__/LocationMarker.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies with vi.hoisted
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

import { useLocationMarker } from '../LocationMarker';

vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock mapbox marker
const mockMarker = {
  remove: vi.fn(),
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
};

const mockMapboxgl = {
  Marker: vi.fn().mockImplementation(() => mockMarker),
};

const mockMapRef = {
  current: {
    // Mock map instance
  },
};

describe('useLocationMarker', () => {
  const defaultProps = {
    mapRef: mockMapRef,
    mapboxgl: mockMapboxgl,
    translate: vi.fn((key: string) => key),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Clean up any existing style elements
    document.querySelectorAll('#location-marker-styles').forEach(el => el.remove());
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up style elements after each test
    document.querySelectorAll('#location-marker-styles').forEach(el => el.remove());
  });

  it('should create location marker with correct coordinates', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    expect(mockMapboxgl.Marker).toHaveBeenCalledWith({
      element: expect.any(HTMLDivElement),
      anchor: 'center',
    });
    expect(mockMarker.setLngLat).toHaveBeenCalledWith([2.3522, 48.8566]);
    expect(mockMarker.addTo).toHaveBeenCalledWith(mockMapRef.current);
  });

  it('should remove existing marker before creating new one', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    // Create first marker
    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    // Create second marker
    act(() => {
      result.current.createLocationMarker([2.2945, 48.8584]);
    });

    // Should have called remove on the first marker
    expect(mockMarker.remove).toHaveBeenCalledTimes(1);
    // Should have created two markers
    expect(mockMapboxgl.Marker).toHaveBeenCalledTimes(2);
  });

  it('should create marker with radar animation styles', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    // Check that Marker was called with an element that has the right structure
    const call = mockMapboxgl.Marker.mock.calls[0];
    const markerElement = call?.[0]?.element;

    expect(markerElement.className).toBe('location-marker');
    expect(markerElement.style.width).toBe('40px');
    expect(markerElement.style.height).toBe('40px');

    // Check for pulse rings
    const pulseRings = markerElement.querySelectorAll('.pulse-ring');
    expect(pulseRings).toHaveLength(2);

    // Check for center dot
    const centerDot = markerElement.querySelector('.center-dot');
    expect(centerDot).toBeTruthy();
  });

  it('should add animation styles to document head', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    // Clear any existing styles
    document.head.innerHTML = '';

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    const styleElement = document.querySelector('#location-marker-styles');
    expect(styleElement).toBeTruthy();
    expect(styleElement?.textContent).toContain('@keyframes radarPulse');
  });

  it('should not add duplicate styles if already exists', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    // Add existing style element
    const existingStyle = document.createElement('style');
    existingStyle.id = 'location-marker-styles';
    existingStyle.textContent = 'existing styles';
    document.head.appendChild(existingStyle);

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    const styleElements = document.querySelectorAll('#location-marker-styles');
    expect(styleElements).toHaveLength(1);
    expect(styleElements[0]?.textContent).toBe('existing styles');
  });

  it('should automatically remove marker after timeout', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    // Fast forward time to trigger timeout
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockMarker.remove).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith('Location marker automatically removed', {
      duration: 2000,
      position: 'bottom-center',
    });
  });

  it('should clear existing timeout when creating new marker', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    // Create first marker
    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    const removeCallsAfterFirst = mockMarker.remove.mock.calls.length;

    // Create second marker before timeout - should remove first marker and clear its timeout
    act(() => {
      vi.advanceTimersByTime(5000); // Half the timeout
      result.current.createLocationMarker([2.2945, 48.8584]);
    });

    // First marker should have been removed
    expect(mockMarker.remove).toHaveBeenCalledTimes(removeCallsAfterFirst + 1);

    // Fast forward past when first timeout would have fired (should not fire)
    act(() => {
      vi.advanceTimersByTime(6000); // Total 11 seconds
    });

    // Still only one more call (first timeout was cleared)
    // Second marker timeout has not fired yet (needs 10s from second creation)
    expect(mockMarker.remove).toHaveBeenCalledTimes(removeCallsAfterFirst + 1);
  });

  it('should remove marker manually', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    act(() => {
      result.current.removeLocationMarker();
    });

    expect(mockMarker.remove).toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { result } = renderHook(() => useLocationMarker(defaultProps));

    act(() => {
      result.current.createLocationMarker([2.3522, 48.8566]);
    });

    act(() => {
      result.current.cleanup();
    });

    expect(mockMarker.remove).toHaveBeenCalled();
  });

  it('should return null if mapRef is not available', () => {
    const propsWithoutMap = {
      ...defaultProps,
      mapRef: { current: null },
    };

    const { result } = renderHook(() => useLocationMarker(propsWithoutMap));

    const marker = result.current.createLocationMarker([2.3522, 48.8566]);
    expect(marker).toBeNull();
    expect(mockMapboxgl.Marker).not.toHaveBeenCalled();
  });

  it('should return null if mapboxgl is not available', () => {
    const propsWithoutMapbox = {
      ...defaultProps,
      mapboxgl: null,
    };

    const { result } = renderHook(() => useLocationMarker(propsWithoutMapbox));

    const marker = result.current.createLocationMarker([2.3522, 48.8566]);
    expect(marker).toBeNull();
  });
});
