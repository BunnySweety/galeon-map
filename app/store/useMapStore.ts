// File: app/store/useMapStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { formatDateDefault } from '../utils/date-utils';
import { activateLocale } from '../i18n';
import { hospitals as importedHospitals } from '../api/hospitals/data';
import { Hospital, HospitalStatus, MapStore } from '../types';
import logger from '../utils/logger';

// Utilisation directe du type Hospital unifié depuis types/index.ts
export const staticHospitals: Hospital[] = importedHospitals;

// Interface MapStore maintenant centralisée dans types/index.ts

// Create store with middlewares - utilise le type MapStore centralisé
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
        searchTerm: '',
        language: 'en',
        selectedHospital: null,
        isLoading: false,
        error: null,
        hydrated: false,
        timelineIndex: 0,
        timelineLength: 0,

        // Actions
        setHospitals: hospitals => {
          set({ hospitals });
          get().applyFilters();
        },
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
        setSearchTerm: searchTerm => {
          set({ searchTerm });
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
          const { hospitals, selectedFilters, currentDate, searchTerm } = get();

          // Filter by status and date together
          const filtered = hospitals.filter(hospital => {
            try {
              // Check status filter first
              const matchesStatusFilter =
                (hospital.status === 'Deployed' && selectedFilters.deployed) ||
                (hospital.status === 'Signed' && selectedFilters.signed);

              if (!matchesStatusFilter) return false;

              // Normalize current date from the store
              const current = new Date(currentDate);
              current.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

              // Normalize hospital deployment date
              const hospitalDate = new Date(hospital.deploymentDate);
              hospitalDate.setUTCHours(0, 0, 0, 0); // Set to UTC midnight

              // Compare dates (UTC midnight vs UTC midnight)
              return hospitalDate <= current;
            } catch (error) {
              logger.error(
                `Error parsing date for hospital ${hospital.id} or current date ${currentDate}:`,
                error
              );
              return false; // Exclude if dates are invalid
            }
          });

          const dateFiltered = filtered;

          // Filter by search term if provided
          const searchFiltered = searchTerm.trim()
            ? dateFiltered.filter(hospital => {
                const searchLower = searchTerm.toLowerCase().trim();
                const nameEn = hospital.nameEn?.toLowerCase() ?? '';
                const nameFr = hospital.nameFr?.toLowerCase() ?? '';
                const address = hospital.address?.toLowerCase() ?? '';
                const website = hospital.website?.toLowerCase() ?? '';

                return (
                  nameEn.includes(searchLower) ||
                  nameFr.includes(searchLower) ||
                  address.includes(searchLower) ||
                  website.includes(searchLower)
                );
              })
            : dateFiltered;

          set({ filteredHospitals: searchFiltered });
          return searchFiltered;
        },
      }),
      {
        name: 'hospital-map-storage',
        partialize: state => ({
          language: state.language,
          selectedFilters: state.selectedFilters,
          searchTerm: state.searchTerm,
        }),
      }
    )
  )
);
