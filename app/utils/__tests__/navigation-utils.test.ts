// File: app/utils/__tests__/navigation-utils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openDirections, shareLocation, getCurrentPosition } from '../navigation-utils';

describe('Navigation Utils', () => {
  const mockOpen = vi.fn();
  const mockShare = vi.fn();
  const mockGetCurrentPosition = vi.fn();
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup window.open mock
    vi.stubGlobal('open', mockOpen);

    // Setup navigator mocks
    vi.stubGlobal('navigator', {
      ...global.navigator,
      share: mockShare,
      clipboard: {
        writeText: mockWriteText,
      },
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('openDirections', () => {
    it('should open Google Maps with correct coordinates', () => {
      const coordinates: [number, number] = [2.3522, 48.8566];
      const hospitalName = 'Test Hospital';

      openDirections(coordinates, hospitalName);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=48.8566,2.3522&travelmode=driving',
        '_blank'
      );
    });

    it('should handle coordinates without hospital name', () => {
      const coordinates: [number, number] = [2.3522, 48.8566];

      openDirections(coordinates);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=48.8566,2.3522&travelmode=driving',
        '_blank'
      );
    });

    it('should format coordinates correctly', () => {
      const coordinates: [number, number] = [2.352233333, 48.856666666];
      const hospitalName = 'Test Hospital';

      openDirections(coordinates, hospitalName);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('destination=48.856666666,2.352233333'),
        '_blank'
      );
    });
  });

  describe('shareLocation', () => {
    it('should use native share API when available', async () => {
      mockShare.mockResolvedValue(undefined);

      const coordinates: [number, number] = [2.3522, 48.8566];
      const hospitalName = 'Test Hospital';
      const url = 'https://example.com/hospital/1';

      await shareLocation(coordinates, hospitalName, url);

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Hospital',
        text: 'Localisation: Test Hospital',
        url: url,
      });
    });

    it('should fallback to clipboard when share API is not available', async () => {
      // Setup navigator without share API
      vi.stubGlobal('navigator', {
        ...global.navigator,
        share: undefined, // No share API
        clipboard: {
          writeText: mockWriteText,
        },
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      });

      mockWriteText.mockResolvedValue(undefined);

      const coordinates: [number, number] = [2.3522, 48.8566];
      const hospitalName = 'Test Hospital';
      const url = 'https://example.com/hospital/1';

      await shareLocation(coordinates, hospitalName, url);

      expect(mockWriteText).toHaveBeenCalledWith(url);
    });

    it('should handle coordinates without hospital name', async () => {
      mockShare.mockResolvedValue(undefined);

      const coordinates: [number, number] = [2.3522, 48.8566];
      const url = 'https://example.com/hospital/1';

      await shareLocation(coordinates, undefined, url);

      expect(mockShare).toHaveBeenCalledWith({
        title: "Localisation d'hôpital",
        text: 'Localisation: 48.8566, 2.3522',
        url: url,
      });
    });
  });

  describe('getCurrentPosition', () => {
    it('should return user position when geolocation succeeds', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({
            latitude: 48.8566,
            longitude: 2.3522,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          }),
        },
        timestamp: Date.now(),
        toJSON: function () {
          return { coords: this.coords, timestamp: this.timestamp };
        },
      };

      mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
        success(mockPosition);
      });

      const result = await getCurrentPosition();

      expect(result).toEqual({
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
      });
    });

    it('should reject when geolocation fails', async () => {
      const mockError: GeolocationPositionError = {
        code: 1,
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGetCurrentPosition.mockImplementation(
        (_: PositionCallback, error: PositionErrorCallback) => {
          error(mockError);
        }
      );

      await expect(getCurrentPosition()).rejects.toEqual(mockError);
    });

    it('should reject when geolocation is not available', async () => {
      // Temporarily remove geolocation
      vi.stubGlobal('navigator', {
        ...global.navigator,
        geolocation: undefined,
      });

      await expect(getCurrentPosition()).rejects.toThrow('Geolocation not supported');
    });

    it('should use high accuracy by default', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({
            latitude: 48.8566,
            longitude: 2.3522,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          }),
        },
        timestamp: Date.now(),
        toJSON: function () {
          return { coords: this.coords, timestamp: this.timestamp };
        },
      };

      mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
        success(mockPosition);
      });

      await getCurrentPosition();

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      );
    });
  });
});
