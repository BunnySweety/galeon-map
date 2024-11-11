import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MapState, MapBounds } from '@/types/map';

const initialState: MapState = {
  bounds: null,
  zoom: 6,
  center: [46.603354, 1.888334],
  isLoading: false,
  error: null
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapBounds: (state, action: PayloadAction<MapBounds>) => {
      state.bounds = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setMapCenter: (state, action: PayloadAction<[number, number]>) => {
      state.center = action.payload;
    },
    setMapLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMapError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetMap: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setMapBounds,
  setMapZoom,
  setMapCenter,
  setMapLoading,
  setMapError,
  resetMap
} = mapSlice.actions;

export default mapSlice.reducer;