import { createAsyncThunk } from '@reduxjs/toolkit';
import { Hospital } from '@/types/hospital';
import { errorService } from '@/services/errorService';
import { api } from '@/services/api';
import { RootState } from './store';
import { FilterState } from '@/types/filters';

export const fetchHospitals = createAsyncThunk(
  'hospitals/fetchHospitals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Hospital[]>('/hospitals');
      return response.data;
    } catch (error) {
      errorService.handleError(error as Error, 'Fetch Hospitals');
      return rejectWithValue('Failed to fetch hospitals');
    }
  }
);

export const updateHospitalStatus = createAsyncThunk(
  'hospitals/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<Hospital>(`/hospitals/${id}`, { status });
      return response.data;
    } catch (error) {
      errorService.handleError(error as Error, 'Update Hospital Status');
      return rejectWithValue('Failed to update hospital status');
    }
  }
);

export const applyFilters = createAsyncThunk(
  'filters/apply',
  async (filters: FilterState, { getState, dispatch }) => {
    const state = getState() as RootState;
    const hospitals = state.hospitals.data;
    
    return {
      filters,
      filteredHospitals: hospitals.filter(hospital => {
        // Status filter
        if (filters.statuses.length && !filters.statuses.includes(hospital.status)) {
          return false;
        }

        // Search filter
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
        if (filters.country && 
            !hospital.address.toLowerCase().includes(filters.country.toLowerCase())) {
          return false;
        }

        // City filter
        if (filters.city && 
            !hospital.address.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }

        return true;
      })
    };
  }
);

const isInRegion = (hospital: Hospital, region: string): boolean => {
  // Simple region checking based on coordinates
  switch (region) {
    case 'Europe':
      return hospital.lat >= 35 && hospital.lat <= 71 && 
             hospital.lon >= -10 && hospital.lon <= 40;
    case 'North America':
      return hospital.lat >= 15 && hospital.lat <= 72 && 
             hospital.lon >= -170 && hospital.lon <= -50;
    // Add other regions...
    default:
      return true;
  }
};