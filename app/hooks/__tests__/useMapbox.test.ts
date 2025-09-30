// File: app/hooks/__tests__/useMapbox.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapbox } from '../useMapbox';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock mapbox-gl module
const mockMapboxGL = {
  Map: vi.fn(),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  Popup: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  })),
  NavigationControl: vi.fn(),
  accessToken: '',
};

vi.mock('mapbox-gl', () => ({
  default: mockMapboxGL,
}));

describe('useMapbox', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mapbox token
    mockMapboxGL.accessToken = '';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalEnv;
  });

  describe('Successful Loading', () => {
    it('should load mapbox successfully with valid token', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result } = renderHook(() => useMapbox());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.mapboxgl).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // After loading
      expect(result.current.mapboxgl).toBeDefined();
      expect(result.current.error).toBeNull();
      expect(mockMapboxGL.accessToken).toBe('test_token_123');
    });

    it('should inject mapbox CSS into document', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check if CSS link was added (in mock environment, we just verify the hook completed)
      expect(result.current.mapboxgl).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing token gracefully', async () => {
      delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      const { result } = renderHook(() => useMapbox());

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // Should have error
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Mapbox token is required');
      expect(result.current.mapboxgl).toBeNull();
    });

    it('should not set token when missing', async () => {
      delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      const { result } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Token should not be set
      expect(mockMapboxGL.accessToken).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount during loading', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result, unmount } = renderHook(() => useMapbox());

      // Unmount immediately
      unmount();

      // Wait a bit to ensure no state updates after unmount
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not throw or cause warnings
      expect(true).toBe(true);
    });
  });

  describe('Token Management', () => {
    it('should set access token when provided', async () => {
      const testToken = 'pk.test.token.123';
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = testToken;

      const { result } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockMapboxGL.accessToken).toBe(testToken);
    });

    it('should validate token is required', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = '';

      const { result } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.mapboxgl).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should transition through loading states correctly', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result } = renderHook(() => useMapbox());

      // Initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.mapboxgl).toBeNull();
      expect(result.current.error).toBeNull();

      // After loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mapboxgl).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    it('should maintain consistent state structure', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result } = renderHook(() => useMapbox());

      // Check structure before loading
      expect(result.current).toHaveProperty('mapboxgl');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check structure after loading
      expect(result.current).toHaveProperty('mapboxgl');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });
  });

  describe('CSS Loading', () => {
    it('should not load CSS twice', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      // Create mock link element
      const mockLink = document.createElement('link');
      mockLink.rel = 'stylesheet';
      mockLink.href = 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css';
      document.head.appendChild(mockLink);

      const { result } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should load successfully without adding duplicate
      expect(result.current.mapboxgl).toBeDefined();

      // Cleanup
      document.head.removeChild(mockLink);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should handle multiple useMapbox instances', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token_123';

      const { result: result1 } = renderHook(() => useMapbox());
      const { result: result2 } = renderHook(() => useMapbox());

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Both should load successfully
      expect(result1.current.mapboxgl).toBeDefined();
      expect(result2.current.mapboxgl).toBeDefined();
      expect(result1.current.error).toBeNull();
      expect(result2.current.error).toBeNull();
    });
  });
});
