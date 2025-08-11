// File: app/store/useMapStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { formatDateDefault } from '../utils/date-utils';
import { activateLocale } from '../i18n';
import { hospitals as importedHospitals, Hospital as HospitalType } from '../api/hospitals/data';
import logger from '../utils/logger';

// Types
export type HospitalStatus = 'Deployed' | 'Signed';

// Re-export the Hospital type with a more explicit coordinates type
export interface Hospital extends Omit<HospitalType, 'coordinates'> {
  coordinates: [number, number]; // Explicitly define as tuple with exactly 2 elements
}

// Cast the imported hospitals to our more specific type
export const staticHospitals: Hospital[] = importedHospitals as Hospital[];

// Keep the interface for backward compatibility
export interface HospitalInterface {
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
  timelineIndex: number;
  timelineLength: number;

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
  setTimelineState: (index: number, length: number) => void;

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
        currentDate: formatDateDefault(new Date()).split('/').reverse().join('-'), // Convert dd/MM/yyyy to yyyy-MM-dd
        selectedFilters: {
          deployed: true,
          signed: true,
        },
        language: 'en',
        selectedHospital: null,
        isLoading: false,
        error: null,
        hydrated: false,
        timelineIndex: 0,
        timelineLength: 0,

        // Actions
        setHospitals: hospitals => set({ hospitals }),
        setFilteredHospitals: hospitals => set({ filteredHospitals: hospitals }),
        setCurrentDate: date => {
          set({ currentDate: date });
          get().applyFilters();
        },
        toggleFilter: filter => {
          set(state => ({
            selectedFilters: {
              ...state.selectedFilters,
              [filter]: !state.selectedFilters[filter],
            },
          }));
          get().applyFilters();
        },
        setLanguage: async language => {
          try {
            logger.debug(`Setting language in store to: ${language}`);

            // Set the language state
            set({ language });

            // Activate the locale without forcing a reload
            await activateLocale(language);

            logger.debug(`Language set to ${language} and locale activated`);
          } catch (error) {
            logger.error('Failed to set language:', error);
            // Revert to previous language on error
            set(state => ({ language: state.language }));
          }
        },
        selectHospital: hospital => set({ selectedHospital: hospital }),
        setLoading: isLoading => set({ isLoading }),
        setError: error => set({ error }),
        setHydrated: hydrated => set({ hydrated }),
        setTimelineState: (index, length) => set({ timelineIndex: index, timelineLength: length }),

        // Derived actions
        initialize: async () => {
          const { fetchHospitals, setHydrated } = get();

          try {
            await fetchHospitals();
            setHydrated(true);
          } catch (error) {
            logger.error('Failed to initialize store:', error);
            setHydrated(false);
          }
        },

        fetchHospitals: async () => {
          const { setLoading, setError, setHospitals, applyFilters } = get();

          try {
            setLoading(true);
            setError(null);

            // Always use static data for consistency between dev and production-like builds
            logger.debug('Using static hospital data (forced)');
            const data = staticHospitals;

            setHospitals(data);

            // --- Set initial currentDate to the earliest deployment date ---
            if (data && data.length > 0) {
              // Sort dates to find the earliest one
              const sortedDates = data.map(h => h.deploymentDate).sort();
              const earliestDate = sortedDates[0];
              // Set the current date in the store if it's different from the initial one
              // This prevents unnecessary updates if today happens to be the earliest date
              if (earliestDate && get().currentDate !== earliestDate) {
                set({ currentDate: earliestDate });
              }
            } // else: No data, keep default currentDate (today)
            // --- End set initial currentDate ---

            // Now apply filters using the potentially updated currentDate
            applyFilters();
          } catch (error) {
            logger.error('Error fetching hospitals:', error);
            // En cas d'erreur, utiliser les données statiques comme fallback
            logger.debug('Error fetching from API, using static data as fallback');
            // Ensure static data is set before potentially setting date
            const fallbackData = staticHospitals;
            setHospitals(fallbackData);
            if (fallbackData && fallbackData.length > 0) {
              const sortedDates = fallbackData.map(h => h.deploymentDate).sort();
              const earliestDate = sortedDates[0];
              if (earliestDate && get().currentDate !== earliestDate) {
                set({ currentDate: earliestDate });
              }
            }
            applyFilters(); // Apply filters even on error with fallback data
            setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setLoading(false);
          }
        },

        applyFilters: () => {
          const { hospitals, selectedFilters, currentDate } = get();

          // Filter by status first (more efficient if many hospitals)
          const statusFiltered = hospitals.filter(hospital => {
            if (hospital.status === 'Deployed' && selectedFilters.deployed) return true;
            if (hospital.status === 'Signed' && selectedFilters.signed) return true;
            return false;
          });

          // Filter by date, ignoring time component for robustness
          const dateFiltered = statusFiltered.filter(hospital => {
            try {
              // Normalize current date from the store
              const current = new Date(currentDate);
              current.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

              // Normalize hospital deployment date
              const hospitalDate = new Date(hospital.deploymentDate);
              hospitalDate.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

              // Compare dates (UTC midnight vs UTC midnight)
              const isBeforeOrOnCurrentDate = hospitalDate <= current;

              // Check if hospital matches current status filters (this part was likely fine)
              const matchesStatusFilter =
                (hospital.status === 'Deployed' && selectedFilters.deployed) ||
                (hospital.status === 'Signed' && selectedFilters.signed);

              return isBeforeOrOnCurrentDate && matchesStatusFilter;
            } catch (error) {
              logger.error(
                `Error parsing date for hospital ${hospital.id} or current date ${currentDate}:`,
                error
              );
              return false; // Exclude if dates are invalid
            }
          });

          set({ filteredHospitals: dateFiltered });
          return dateFiltered;
        },
      }),
      {
        name: 'hospital-map-storage',
        partialize: state => ({
          language: state.language,
          selectedFilters: state.selectedFilters,
        }),
      }
    )
  )
);
