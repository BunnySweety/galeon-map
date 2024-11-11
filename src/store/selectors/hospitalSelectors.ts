import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/types/store';
import { Hospital, HospitalStatus } from '@/types/hospital';
import { FilterState } from '@/types/filters';
import { MapBounds } from '@/types/map';

// Base selectors
const selectHospitals = (state: RootState) => state.hospitals.data;
const selectFilters = (state: RootState) => state.filters;
const selectMapBounds = (state: RootState) => state.map.bounds;
const selectSearchTerm = (state: RootState) => state.filters.searchTerm;
const selectActiveStatuses = (state: RootState) => state.filters.statuses;

// Memoized selectors
export const selectFilteredHospitals = createSelector(
  [selectHospitals, selectFilters, selectMapBounds],
  (hospitals, filters, bounds): Hospital[] => {
    return hospitals.filter(hospital => {
      // Status filter
      if (filters.statuses.length && !filters.statuses.includes(hospital.status)) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!hospital.name.toLowerCase().includes(searchLower) &&
            !hospital.address.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Region filter
      if (filters.region && !isInRegion(hospital, filters.region)) {
        return false;
      }

      // Country filter
      if (filters.country && !hospital.address.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }

      // City filter
      if (filters.city && !hospital.address.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Map bounds filter
      if (bounds) {
        if (hospital.lat > bounds.north || hospital.lat < bounds.south ||
            hospital.lon > bounds.east || hospital.lon < bounds.west) {
          return false;
        }
      }

      return true;
    });
  }
);

export const selectHospitalStatistics = createSelector(
  [selectFilteredHospitals],
  (hospitals) => {
    const stats = {
      totalCount: hospitals.length,
      deployedCount: 0,
      inProgressCount: 0,
      signedCount: 0,
      byRegion: {} as Record<string, number>,
      byCountry: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
      averageDeploymentTime: 0
    };

    hospitals.forEach(hospital => {
      // Count by status
      switch (hospital.status) {
        case 'Deployed':
          stats.deployedCount++;
          break;
        case 'In Progress':
          stats.inProgressCount++;
          break;
        case 'Signed':
          stats.signedCount++;
          break;
      }

      // Count by region
      const region = getHospitalRegion(hospital);
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;

      // Count by country
      const country = extractCountry(hospital.address);
      stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    });

    return stats;
  }
);

export const selectHospitalsByStatus = createSelector(
  [selectFilteredHospitals, selectActiveStatuses],
  (hospitals, activeStatuses) => {
    const result: Record<HospitalStatus, Hospital[]> = {
      Deployed: [],
      'In Progress': [],
      Signed: []
    };

    hospitals.forEach(hospital => {
      if (!activeStatuses.length || activeStatuses.includes(hospital.status)) {
        result[hospital.status].push(hospital);
      }
    });

    return result;
  }
);

export const selectHospitalsByRegion = createSelector(
  [selectFilteredHospitals],
  (hospitals) => {
    return hospitals.reduce((acc, hospital) => {
      const region = getHospitalRegion(hospital);
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(hospital);
      return acc;
    }, {} as Record<string, Hospital[]>);
  }
);

export const selectNearbyHospitals = createSelector(
  [selectFilteredHospitals, 
   (state: RootState, center: [number, number], radius: number) => ({ center, radius })],
  (hospitals, { center, radius }) => {
    const [centerLat, centerLon] = center;
    return hospitals.filter(hospital => {
      const distance = calculateDistance(
        centerLat, 
        centerLon, 
        hospital.lat, 
        hospital.lon
      );
      return distance <= radius;
    });
  }
);

export const selectHospitalSearchSuggestions = createSelector(
  [selectHospitals, selectSearchTerm],
  (hospitals, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const searchLower = searchTerm.toLowerCase();
    const matches = hospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(searchLower) ||
      hospital.address.toLowerCase().includes(searchLower)
    );

    return matches.slice(0, 10).map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      address: hospital.address,
      status: hospital.status
    }));
  }
);

// Helper functions
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const isInRegion = (hospital: Hospital, region: string): boolean => {
  // Simple region checking based on coordinates
  switch (region) {
    case 'Europe':
      return hospital.lat >= 35 && hospital.lat <= 71 && 
             hospital.lon >= -10 && hospital.lon <= 40;
    case 'North America':
      return hospital.lat >= 15 && hospital.lat <= 72 && 
             hospital.lon >= -170 && hospital.lon <= -50;
    case 'South America':
      return hospital.lat >= -55 && hospital.lat <= 15 && 
             hospital.lon >= -80 && hospital.lon <= -35;
    case 'Asia':
      return hospital.lat >= -10 && hospital.lat <= 55 && 
             hospital.lon >= 60 && hospital.lon <= 150;
    case 'Africa':
      return hospital.lat >= -35 && hospital.lat <= 37 && 
             hospital.lon >= -20 && hospital.lon <= 50;
    case 'Oceania':
      return hospital.lat >= -50 && hospital.lat <= 0 && 
             hospital.lon >= 110 && hospital.lon <= 180;
    default:
      return true;
  }
};

const getHospitalRegion = (hospital: Hospital): string => {
  if (isInRegion(hospital, 'Europe')) return 'Europe';
  if (isInRegion(hospital, 'North America')) return 'North America';
  if (isInRegion(hospital, 'South America')) return 'South America';
  if (isInRegion(hospital, 'Asia')) return 'Asia';
  if (isInRegion(hospital, 'Africa')) return 'Africa';
  if (isInRegion(hospital, 'Oceania')) return 'Oceania';
  return 'Other';
};

const extractCountry = (address: string): string => {
  const parts = address.split(',');
  return parts[parts.length - 1].trim();
};

export const {
  selectHospitals,
  selectFilters,
  selectMapBounds,
  selectSearchTerm,
  selectActiveStatuses
};