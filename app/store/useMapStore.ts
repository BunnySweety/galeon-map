// File: app/store/useMapStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { LocaleType } from '../i18n';

// Types
export type HospitalStatus = 'Deployed' | 'Signed';

export interface Hospital {
  id: string;
  name: string;
  status: HospitalStatus;
  deploymentDate: string;
  website: string;
  coordinates: [number, number];
  address: string;
  imageUrl: string;
}

interface MapStore {
  // State
  hospitals: Hospital[];
  filteredHospitals: Hospital[];
  currentDate: string;
  selectedFilters: {
    deployed: boolean;
    signed: boolean;
  };
  language: LocaleType;
  selectedHospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  isPlaying: boolean;
  
  // Actions
  setHospitals: (hospitals: Hospital[]) => void;
  setFilteredHospitals: (hospitals: Hospital[]) => void;
  setCurrentDate: (date: string) => void;
  toggleFilter: (filter: 'deployed' | 'signed') => void;
  setLanguage: (language: LocaleType) => void;
  selectHospital: (hospital: Hospital | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  
  // Derived actions
  initialize: () => Promise<void>;
  fetchHospitals: () => Promise<void>;
  applyFilters: () => void;
}

// Create store with middlewares
export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        hospitals: [],
        filteredHospitals: [],
        currentDate: format(new Date(), 'yyyy-MM-dd'),
        selectedFilters: {
          deployed: true,
          signed: true,
        },
        language: 'fr',
        selectedHospital: null,
        isLoading: true,
        error: null,
        hydrated: false,
        isPlaying: false,
        
        // Actions
        setHospitals: (hospitals) => set({ hospitals }),
        setFilteredHospitals: (hospitals) => set({ filteredHospitals: hospitals }),
        setCurrentDate: (date) => set({ currentDate: date }),
        toggleFilter: (filter) => {
          set((state) => ({
            selectedFilters: {
              ...state.selectedFilters,
              [filter]: !state.selectedFilters[filter],
            },
          }));
          get().applyFilters();
        },
        setLanguage: (language) => set({ language }),
        selectHospital: (hospital) => set({ selectedHospital: hospital }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setHydrated: (hydrated) => set({ hydrated }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        
        // Derived actions
        initialize: async () => {
          const { fetchHospitals, setHydrated } = get();
          
          try {
            await fetchHospitals();
            setHydrated(true);
          } catch (error) {
            console.error('Failed to initialize store:', error);
            setHydrated(false);
          }
        },
        
        fetchHospitals: async () => {
          const { setLoading, setError, setHospitals, applyFilters } = get();
          
          try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/hospitals');
            
            if (!response.ok) {
              throw new Error('Failed to fetch hospitals');
            }
            
            const data = await response.json();
            setHospitals(data);
            applyFilters();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setLoading(false);
          }
        },
        
        applyFilters: () => {
          const { hospitals, selectedFilters, currentDate } = get();
          
          // Filter by status
          const statusFiltered = hospitals.filter((hospital) => {
            if (hospital.status === 'Deployed' && selectedFilters.deployed) return true;
            if (hospital.status === 'Signed' && selectedFilters.signed) return true;
            return false;
          });
          
          // Filter by date
          const dateFiltered = statusFiltered.filter((hospital) => {
            const hospitalDate = new Date(hospital.deploymentDate);
            const current = new Date(currentDate);
            return hospitalDate <= current;
          });
          
          set({ filteredHospitals: dateFiltered });
        },
      }),
      {
        name: 'hospital-map-storage',
        partialize: (state) => ({
          language: state.language,
          selectedFilters: state.selectedFilters,
        }),
      }
    )
  )
);