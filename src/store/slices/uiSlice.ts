import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, ToastState } from '@/types/store';

const initialState: UIState = {
  language: 'en',
  darkMode: false,
  isSidebarOpen: true,
  isLegendVisible: true,
  selectedHospital: null,
  toast: null
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      // Update document class
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleLegend: (state) => {
      state.isLegendVisible = !state.isLegendVisible;
    },
    setSelectedHospital: (state, action: PayloadAction<string | null>) => {
      state.selectedHospital = action.payload;
    },
    showToast: (state, action: PayloadAction<ToastState>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
    setUIState: (state, action: PayloadAction<Partial<UIState>>) => {
      Object.assign(state, action.payload);
    }
  }
});

export const {
  setLanguage,
  setDarkMode,
  toggleSidebar,
  toggleLegend,
  setSelectedHospital,
  showToast,
  hideToast,
  setUIState
} = uiSlice.actions;

export default uiSlice.reducer;