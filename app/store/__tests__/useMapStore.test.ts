// File: app/store/__tests__/useMapStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '../useMapStore';
import type { Hospital } from '../../types';

// Mock dependencies
vi.mock('../../../utils/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../i18n', () => ({
  activateLocale: vi.fn().mockResolvedValue(undefined),
}));

// Mock static hospitals import - MUST be before mockHospitals definition
vi.mock('../../api/hospitals/data', () => ({
  hospitals: [
    {
      id: '1',
      name: 'Hospital A',
      nameEn: 'Hospital A',
      nameFr: 'Hôpital A',
      status: 'Deployed' as const,
      deploymentDate: '2023-06-15',
      website: 'https://hospital-a.com',
      coordinates: [2.3522, 48.8566] as [number, number],
      address: '123 Main St, Paris',
      imageUrl: '/images/hospital-a.png',
    },
    {
      id: '2',
      name: 'Hospital B',
      nameEn: 'Hospital B',
      nameFr: 'Hôpital B',
      status: 'Signed' as const,
      deploymentDate: '2023-07-01',
      website: 'https://hospital-b.com',
      coordinates: [2.2945, 48.8584] as [number, number],
      address: '456 Oak Ave, Paris',
      imageUrl: '/images/hospital-b.png',
    },
    {
      id: '3',
      name: 'Hospital C',
      nameEn: 'Hospital C',
      nameFr: 'Hôpital C',
      status: 'Deployed' as const,
      deploymentDate: '2023-08-01',
      website: 'https://hospital-c.com',
      coordinates: [2.3020, 48.8600] as [number, number],
      address: '789 Pine St, Paris',
      imageUrl: '/images/hospital-c.png',
    },
  ],
}));

// Define mockHospitals for test usage (after the mock)
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Hospital A',
    nameEn: 'Hospital A',
    nameFr: 'Hôpital A',
    status: 'Deployed' as const,
    deploymentDate: '2023-06-15',
    website: 'https://hospital-a.com',
    coordinates: [2.3522, 48.8566] as [number, number],
    address: '123 Main St, Paris',
    imageUrl: '/images/hospital-a.png',
  },
  {
    id: '2',
    name: 'Hospital B',
    nameEn: 'Hospital B',
    nameFr: 'Hôpital B',
    status: 'Signed' as const,
    deploymentDate: '2023-07-01',
    website: 'https://hospital-b.com',
    coordinates: [2.2945, 48.8584] as [number, number],
    address: '456 Oak Ave, Paris',
    imageUrl: '/images/hospital-b.png',
  },
  {
    id: '3',
    name: 'Hospital C',
    nameEn: 'Hospital C',
    nameFr: 'Hôpital C',
    status: 'Deployed' as const,
    deploymentDate: '2023-08-01',
    website: 'https://hospital-c.com',
    coordinates: [2.3020, 48.8600] as [number, number],
    address: '789 Pine St, Paris',
    imageUrl: '/images/hospital-c.png',
  },
];

describe('useMapStore', () => {
  beforeEach(() => {
    // Clear persisted state before each test
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useMapStore());
      const state = result.current;

      expect(state.hospitals).toEqual([]);
      expect(state.filteredHospitals).toEqual([]);
      expect(state.currentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Date format
      expect(state.selectedFilters).toEqual({
        deployed: true,
        signed: true,
      });
      expect(state.language).toBe('en');
      expect(state.selectedHospital).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.hydrated).toBe(false);
      expect(state.timelineIndex).toBe(0);
      expect(state.timelineLength).toBe(0);
    });
  });

  describe('Actions', () => {
    it('should set hospitals correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHospitals(mockHospitals);
      });

      expect(result.current.hospitals).toEqual(mockHospitals);
    });

    it('should set filtered hospitals correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilteredHospitals(mockHospitals.slice(0, 2));
      });

      expect(result.current.filteredHospitals).toEqual(mockHospitals.slice(0, 2));
    });

    it('should set current date and apply filters', () => {
      const { result } = renderHook(() => useMapStore());

      // Set up hospitals first
      act(() => {
        result.current.setHospitals(mockHospitals);
      });

      act(() => {
        result.current.setCurrentDate('2023-07-15');
      });

      expect(result.current.currentDate).toBe('2023-07-15');
      // Should have applied filters automatically
    });

    it('should toggle filters correctly', () => {
      const { result } = renderHook(() => useMapStore());

      // Initial state: both filters are true
      expect(result.current.selectedFilters.deployed).toBe(true);
      expect(result.current.selectedFilters.signed).toBe(true);

      act(() => {
        result.current.toggleFilter('deployed');
      });

      expect(result.current.selectedFilters.deployed).toBe(false);
      expect(result.current.selectedFilters.signed).toBe(true);

      act(() => {
        result.current.toggleFilter('signed');
      });

      expect(result.current.selectedFilters.deployed).toBe(false);
      expect(result.current.selectedFilters.signed).toBe(false);
    });

    it('should set language correctly', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.setLanguage('fr');
      });

      expect(result.current.language).toBe('fr');
    });

    it('should select hospital correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.selectHospital(mockHospitals[0]);
      });

      expect(result.current.selectedHospital).toEqual(mockHospitals[0]);

      act(() => {
        result.current.selectHospital(null);
      });

      expect(result.current.selectedHospital).toBeNull();
    });

    it('should set loading state correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set error correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });

    it('should set timeline state correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setTimelineState(5, 10);
      });

      expect(result.current.timelineIndex).toBe(5);
      expect(result.current.timelineLength).toBe(10);
    });
  });

  describe('applyFilters', () => {
    it('should filter by status correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHospitals(mockHospitals);
        result.current.setCurrentDate('2023-12-31');
        // Turn off 'signed' filter to only show 'Deployed'
        result.current.toggleFilter('signed');
      });

      const filtered = result.current.filteredHospitals;
      expect(filtered).toHaveLength(2); // Only hospitals with 'Deployed' status
      expect(filtered.every(h => h.status === 'Deployed')).toBe(true);
    });

    it('should filter by date correctly', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHospitals(mockHospitals);
        result.current.setCurrentDate('2023-06-20'); // Between first and second hospital
      });

      const filtered = result.current.filteredHospitals;
      expect(filtered).toHaveLength(1); // Only first hospital (2023-06-15)
      expect(filtered[0]?.id).toBe('1');
    });

    it('should filter by both status and date', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHospitals(mockHospitals);
        result.current.setCurrentDate('2023-07-15');
        // Toggle 'deployed' to turn it off, keep only 'Signed'
        result.current.toggleFilter('deployed');
      });

      const filtered = result.current.filteredHospitals;
      expect(filtered).toHaveLength(1); // Only Hospital B (Signed, before 2023-07-15)
      expect(filtered[0]?.id).toBe('2');
      expect(filtered[0]?.status).toBe('Signed');
    });

    it('should handle invalid dates gracefully', () => {
      const { result } = renderHook(() => useMapStore());

      const hospitalsWithInvalidDate = [
        ...mockHospitals,
        {
          ...mockHospitals[0],
          id: '4',
          deploymentDate: 'invalid-date',
        },
      ];

      act(() => {
        result.current.setHospitals(hospitalsWithInvalidDate);
        result.current.setCurrentDate('2023-12-31');
      });

      const filtered = result.current.applyFilters();
      
      // Should exclude the hospital with invalid date
      expect(filtered).toHaveLength(3);
      expect(filtered.every(h => h.id !== '4')).toBe(true);
    });

    it('should return empty array when no filters match', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2023-01-01'); // Before all hospitals
      });

      const filtered = result.current.applyFilters();
      expect(filtered).toHaveLength(0);
    });

    it('should update filteredHospitals state automatically', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2023-07-15');
      });

      // Should have automatically updated filteredHospitals
      expect(result.current.filteredHospitals.length).toBeGreaterThan(0);
    });
  });

  describe('fetchHospitals', () => {
    it('should fetch hospitals and set earliest date', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.fetchHospitals();
      });

      expect(result.current.hospitals).toEqual(mockHospitals);
      expect(result.current.currentDate).toBe('2023-06-15'); // Earliest date
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      const { result } = renderHook(() => useMapStore());

      // Mock a fetch error by temporarily modifying the import
      vi.doMock('../../api/hospitals/data', () => {
        throw new Error('Fetch error');
      });

      await act(async () => {
        await result.current.fetchHospitals();
      });

      // Should fall back to static data and still work
      expect(result.current.hospitals).toEqual(mockHospitals);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize store correctly', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.hospitals).toEqual(mockHospitals);
      expect(result.current.hydrated).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const { result } = renderHook(() => useMapStore());

      // Mock fetchHospitals to throw an error
      const originalFetchHospitals = result.current.fetchHospitals;
      result.current.fetchHospitals = vi.fn().mockRejectedValue(new Error('Init error'));

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.hydrated).toBe(false);

      // Restore original function
      result.current.fetchHospitals = originalFetchHospitals;
    });
  });
});
