import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Hospital, HospitalsState } from '@/types/store';

const initialState: HospitalsState = {
  data: [],
  statistics: {
    totalCount: 0,
    deployedCount: 0,
    inProgressCount: 0,
    signedCount: 0,
    byRegion: {},
    byCountry: {}
  },
  isLoading: false,
  error: null
};

export const hospitalSlice = createSlice({
  name: 'hospitals',
  initialState,
  reducers: {
    setHospitals: (state, action: PayloadAction<Hospital[]>) => {
      state.data = action.payload;
      state.statistics = calculateStatistics(action.payload);
    },
    addHospital: (state, action: PayloadAction<Hospital>) => {
      state.data.push(action.payload);
      state.statistics = calculateStatistics(state.data);
    },
    updateHospital: (state, action: PayloadAction<Hospital>) => {
      const index = state.data.findIndex(h => h.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
        state.statistics = calculateStatistics(state.data);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Helper function to calculate statistics
const calculateStatistics = (hospitals: Hospital[]) => {
  const stats = {
    totalCount: hospitals.length,
    deployedCount: 0,
    inProgressCount: 0,
    signedCount: 0,
    byRegion: {} as Record<string, number>,
    byCountry: {} as Record<string, number>
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
    const region = getHospitalRegion(hospital.lat, hospital.lon);
    stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;

    // Count by country
    const country = extractCountry(hospital.address);
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
  });

  return stats;
};

export const {
  setHospitals,
  addHospital,
  updateHospital,
  setLoading,
  setError
} = hospitalSlice.actions;

export default hospitalSlice.reducer;