// ===== TYPES CENTRALISÉS - GALEON HOSPITAL MAP =====
// Unification de tous les types pour éviter les duplications
// Version unique source de vérité pour les types Hospital
// ===================================================

// Re-export des types Hospital depuis la source autoritaire (Zod)
import type { Hospital as BaseHospital, Hospitals as BaseHospitals } from '../api/hospitals/data';
export { HospitalSchema, HospitalsSchema } from '../api/hospitals/data';

// Réexport des types pour usage local
export type Hospital = BaseHospital;
export type Hospitals = BaseHospitals;

// Re-export des types Mapbox
export type {
  MapboxMap,
  MapboxGLInstance,
  MapboxMarker,
  MapboxPopup,
  MapboxGeoJSONSource,
  MapboxEvent,
  GeolocationPosition,
  GeolocationError,
  MapboxLayer,
  MapboxStyle,
} from './mapbox';

// Type pour le status des hôpitaux (extrait du schema Zod)
export type HospitalStatus = 'Deployed' | 'Signed';

// Types pour le store Zustand
export interface MapStore {
  // State
  hospitals: Hospital[];
  filteredHospitals: Hospital[];
  currentDate: string;
  selectedFilters: {
    deployed: boolean;
    signed: boolean;
  };
  searchTerm: string;
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
  setSearchTerm: (searchTerm: string) => void;
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

// Types pour les props des composants
export interface HospitalDetailProps {
  hospital: Hospital | null;
  className?: string;
}

export interface HospitalTableProps {
  className?: string;
}

export interface HospitalMarkersProps {
  mapRef: React.MutableRefObject<any>;
  mapboxgl: any;
  mapLoaded: boolean;
}

export interface ActionBarProps {
  className?: string;
}

// Type pour l'internationalisation
export type LocaleType = 'en' | 'fr';

// Types pour les pages dynamiques
export interface HospitalPageProps {
  params: {
    id: string;
  };
}

export interface HospitalDetailClientProps {
  hospitalId: string;
}

export interface HospitalPageClientProps {
  hospitalId: string;
}

// ===== NOTES IMPORTANTES =====
// 1. Tous les imports de types Hospital DOIVENT venir de ce fichier
// 2. Ne plus utiliser les définitions duplicées dans useMapStore.ts
// 3. Source de vérité : app/api/hospitals/data.ts (avec Zod validation)
// =============================================
