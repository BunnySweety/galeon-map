// File: app/hooks/__tests__/useGeolocation.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useGeolocation', () => {
  const mockPosition: GeolocationPosition = {
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 100,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 100,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      }),
    },
    timestamp: Date.now(),
    toJSON: function () {
      return {
        coords: this.coords,
        timestamp: this.timestamp,
      };
    },
  };

  const mockError: GeolocationPositionError = {
    code: 1,
    message: 'Permission denied',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset geolocation mock using vi.stubGlobal
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success(mockPosition);
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    vi.stubGlobal('navigator', {
      ...global.navigator,
      geolocation: mockGeolocation,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
      expect(result.current.accuracy).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Getting Current Position', () => {
    it('should get user position successfully', async () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      // Wait for async state update
      await vi.waitFor(() => {
        expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      });

      expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      expect(result.current.longitude).toBe(mockPosition.coords.longitude);
      expect(result.current.accuracy).toBe(mockPosition.coords.accuracy);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during position fetch', async () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      // Check loading state immediately after calling getPosition
      await vi.waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should use high accuracy by default', async () => {
      const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
        success(mockPosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.getPosition();
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle permission denied error', async () => {
      const mockGetCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
        error(mockError);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle position unavailable error', async () => {
      const unavailableError: GeolocationPositionError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockGetCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
        error(unavailableError);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getPosition();
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toContain('unavailable');
    });

    it('should handle timeout error', async () => {
      const timeoutError: GeolocationPositionError = {
        code: 3,
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockGetCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
        error(timeoutError);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('Timeout');
    });

    it('should handle geolocation not available', async () => {
      // Remove geolocation from navigator
      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: undefined,
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      // Should set error immediately since geolocation is not available
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('not supported');
      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
    });
  });

  describe('Options', () => {
    it('should accept custom timeout', async () => {
      const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
        success(mockPosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation({ timeout: 10000 }));

      await act(async () => {
        await result.current.getPosition();
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });

    it('should accept custom maximumAge', async () => {
      const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
        success(mockPosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation({ maximumAge: 60000 }));

      await act(async () => {
        await result.current.getPosition();
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          maximumAge: 60000,
        })
      );
    });

    it('should allow disabling high accuracy', async () => {
      const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
        success(mockPosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation({ enableHighAccuracy: false }));

      await act(async () => {
        await result.current.getPosition();
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: false,
        })
      );
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple getPosition calls', async () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      });

      const firstLatitude = result.current.latitude;
      const firstLongitude = result.current.longitude;

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      });

      const secondLatitude = result.current.latitude;
      const secondLongitude = result.current.longitude;

      expect(firstLatitude).toBe(secondLatitude);
      expect(firstLongitude).toBe(secondLongitude);
    });

    it('should clear previous error on successful fetch', async () => {
      // First call fails
      const mockGetCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
        error(mockError);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBeTruthy();

      // Second call succeeds
      const successMock = vi.fn((success: PositionCallback) => {
        success(mockPosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: successMock,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.latitude).toBe(mockPosition.coords.latitude);
    });
  });

  describe('Coordinates Conversion', () => {
    it('should convert coordinates to correct format', async () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      });

      expect(result.current.latitude).toBe(mockPosition.coords.latitude);
      expect(result.current.longitude).toBe(mockPosition.coords.longitude);
    });

    it('should handle decimal coordinates correctly', async () => {
      const precisePosition: GeolocationPosition = {
        coords: {
          latitude: 48.856614,
          longitude: 2.352222,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({
            latitude: 48.856614,
            longitude: 2.352222,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          }),
        },
        timestamp: Date.now(),
        toJSON: function () {
          return {
            coords: this.coords,
            timestamp: this.timestamp,
          };
        },
      };

      const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
        success(precisePosition);
      });

      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getPosition();
      });

      await vi.waitFor(() => {
        expect(result.current.latitude).toBe(48.856614);
      });

      expect(result.current.latitude).toBe(48.856614);
      expect(result.current.longitude).toBe(2.352222);
    });
  });
});
