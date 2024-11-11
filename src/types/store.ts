import { Hospital, HospitalStatistics } from './hospital';
import { FilterState } from './filters';
import { MapState } from './map';

export interface RootState {
  hospitals: HospitalsState;
  filters: FilterState;
  map: MapState;
  ui: UIState;
}

export interface HospitalsState {
  data: Hospital[];
  statistics: HospitalStatistics;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  language: string;
  darkMode: boolean;
  isSidebarOpen: boolean;
  isLegendVisible: boolean;
  selectedHospital: string | null;
  toast: ToastState | null;
}

export interface ToastState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

export type AppDispatch = typeof store.dispatch;