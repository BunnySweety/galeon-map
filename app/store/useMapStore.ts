// File: app/store/useMapStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { activateLocale } from '../i18n';

// Types
export type HospitalStatus = 'Deployed' | 'Signed';

export interface Hospital {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
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
  language: 'en' | 'fr';
  selectedHospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  
  // Actions
  setHospitals: (hospitals: Hospital[]) => void;
  setFilteredHospitals: (hospitals: Hospital[]) => void;
  setCurrentDate: (date: string) => void;
  toggleFilter: (filter: 'deployed' | 'signed') => void;
  setLanguage: (language: 'en' | 'fr') => void;
  selectHospital: (hospital: Hospital | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  
  // Derived actions
  initialize: () => Promise<void>;
  fetchHospitals: () => Promise<void>;
  applyFilters: () => Hospital[];
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
        language: 'en',
        selectedHospital: null,
        isLoading: false,
        error: null,
        hydrated: false,
        
        // Actions
        setHospitals: (hospitals) => set({ hospitals }),
        setFilteredHospitals: (hospitals) => set({ filteredHospitals: hospitals }),
        setCurrentDate: (date) => {
          set({ currentDate: date });
          get().applyFilters();
        },
        toggleFilter: (filter) => {
          set((state) => ({
            selectedFilters: {
              ...state.selectedFilters,
              [filter]: !state.selectedFilters[filter],
            },
          }));
          get().applyFilters();
        },
        setLanguage: async (language) => {
          try {
            console.log(`Setting language in store to: ${language}`);
            
            // Set the language state
            set({ language });
            
            // Activate the locale without forcing a reload
            await activateLocale(language);
            
            console.log(`Language set to ${language} and locale activated`);
          } catch (error) {
            console.error('Failed to set language:', error);
            // Revert to previous language on error
            set((state) => ({ language: state.language }));
          }
        },
        selectHospital: (hospital) => set({ selectedHospital: hospital }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setHydrated: (hydrated) => set({ hydrated }),
        
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
          
          // Filter by date, status, and status filter
          const dateFiltered = statusFiltered.filter((hospital) => {
            const hospitalDate = new Date(hospital.deploymentDate);
            const current = new Date(currentDate);
            
            // Check if hospital is deployed or signed before or on current date
            const isBeforeOrOnCurrentDate = hospitalDate <= current;
            
            // Check if hospital matches current status filters
            const matchesStatusFilter = 
              (hospital.status === 'Deployed' && selectedFilters.deployed) ||
              (hospital.status === 'Signed' && selectedFilters.signed);
            
            return isBeforeOrOnCurrentDate && matchesStatusFilter;
          });
          
          set({ filteredHospitals: dateFiltered });
          return dateFiltered;
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