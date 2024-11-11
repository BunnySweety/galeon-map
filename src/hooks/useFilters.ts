import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setSearchTerm,
  setCountry,
  setCity,
  setRegion,
  toggleStatus,
  resetFilters
} from '@/store/slices/filtersSlice';
import { selectFilteredHospitals } from '@/store/selectors/hospitalSelectors';
import { Hospital } from '@/types/hospital';
import { FilterState } from '@/types/filters';

export const useFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.filters);
  const filteredHospitals = useAppSelector(selectFilteredHospitals);

  const updateSearchTerm = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  const updateCountry = useCallback((country: string) => {
    dispatch(setCountry(country));
  }, [dispatch]);

  const updateCity = useCallback((city: string) => {
    dispatch(setCity(city));
  }, [dispatch]);

  const updateRegion = useCallback((region: string) => {
    dispatch(setRegion(region));
  }, [dispatch]);

  const toggleStatusFilter = useCallback((status: string) => {
    dispatch(toggleStatus(status));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const applyFilters = useCallback((hospitals: Hospital[], filters: FilterState) => {
    return hospitals.filter(hospital => {
      // Status filter
      if (filters.statuses.length && !filters.statuses.includes(hospital.status)) {
        return false;
      }

      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = hospital.name.toLowerCase().includes(searchLower);
        const addressMatch = hospital.address.toLowerCase().includes(searchLower);
        if (!nameMatch && !addressMatch) return false;
      }

      // Country filter
      if (filters.country && !hospital.address.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }

      // City filter
      if (filters.city && !hospital.address.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Region filter
      if (filters.region) {
        const hospitalRegion = getHospitalRegion(hospital.lat, hospital.lon);
        if (hospitalRegion !== filters.region) return false;
      }

      return true;
    });
  }, []);

  return {
    filters,
    filteredHospitals,
    updateSearchTerm,
    updateCountry,
    updateCity,
    updateRegion,
    toggleStatusFilter,
    clearAllFilters,
    applyFilters
  };
};

// Helper function to determine hospital region
const getHospitalRegion = (lat: number, lon: number): string => {
  // Simple region determination based on coordinates
  if (lat >= 35 && lat <= 71 && lon >= -10 && lon <= 40) return 'Europe';
  if (lat >= 15 && lat <= 72 && lon >= -170 && lon <= -50) return 'North America';
  if (lat >= -55 && lat <= 15 && lon >= -80 && lon <= -35) return 'South America';
  if (lat >= -10 && lat <= 55 && lon >= 60 && lon <= 150) return 'Asia';
  if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 50) return 'Africa';
  if (lat >= -50 && lat <= 0 && lon >= 110 && lon <= 180) return 'Oceania';
  return 'Unknown';
};

export default useFilters;