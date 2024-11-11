import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState } from '@/types/filters';
import { HospitalStatus } from '@/types/hospital';

const initialState: FilterState = {
  statuses: [],
  searchTerm: '',
  country: '',
  city: '',
  region: ''
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload;
      // Reset city when country changes
      if (!action.payload) {
        state.city = '';
      }
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
      // Reset country and city when region changes
      if (!action.payload) {
        state.country = '';
        state.city = '';
      }
    },
    toggleStatus: (state, action: PayloadAction<HospitalStatus>) => {
      const index = state.statuses.indexOf(action.payload);
      if (index === -1) {
        state.statuses.push(action.payload);
      } else {
        state.statuses.splice(index, 1);
      }
    },
    setStatuses: (state, action: PayloadAction<HospitalStatus[]>) => {
      state.statuses = action.payload;
    },
    resetFilters: (state) => {
      Object.assign(state, initialState);
    },
    applyFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      Object.assign(state, action.payload);
    }
  }
});

export const {
  setSearchTerm,
  setCountry,
  setCity,
  setRegion,
  toggleStatus,
  setStatuses,
  resetFilters,
  applyFilters
} = filtersSlice.actions;

export default filtersSlice.reducer;