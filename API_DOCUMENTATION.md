# API Documentation

Documentation complète des APIs, types et interfaces du projet Galeon Community Hospital Map.

## Table des Matières

- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Custom Hooks](#custom-hooks)
- [Utility Functions](#utility-functions)
- [Store (Zustand)](#store-zustand)
- [Monitoring & Analytics](#monitoring--analytics)

---

## Data Models

### Hospital

Type principal représentant un hôpital dans le système.

```typescript
interface Hospital {
  id: string; // Identifiant unique
  name: string; // Nom de l'hôpital (FR)
  nameEn?: string; // Nom en anglais
  city: string; // Ville
  address: string; // Adresse complète
  location: [number, number]; // [longitude, latitude]
  status: HospitalStatus; // Statut de déploiement
  deploymentDate?: string; // Date ISO 8601
  signatureDate?: string; // Date de signature
  capacity?: number; // Capacité en lits
  specialties?: string[]; // Spécialités médicales
}
```

### HospitalStatus

```typescript
type HospitalStatus = 'deployed' | 'signed' | 'planned' | 'inactive';
```

### MapState

État global de la carte (Zustand store).

```typescript
interface MapState {
  // Filters
  selectedFilters: HospitalStatus[];
  setSelectedFilters: (filters: HospitalStatus[]) => void;

  // Selected hospital
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;

  // Timeline
  currentTimelineDate: string | null;
  setCurrentTimelineDate: (date: string | null) => void;

  // View state
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  setViewState: (state: Partial<ViewState>) => void;
}
```

---

## API Endpoints

### GET /api/hospitals

Retourne la liste de tous les hôpitaux.

**Response:**

```typescript
{
  hospitals: Hospital[];
  total: number;
  timestamp: string;
}
```

**Example:**

```bash
curl https://map.galeon.community/api/hospitals
```

### GET /api/hospitals/[id]

Retourne les détails d'un hôpital spécifique.

**Parameters:**

- `id` (string): ID de l'hôpital

**Response:**

```typescript
{
  hospital: Hospital;
}
```

**Example:**

```bash
curl https://map.galeon.community/api/hospitals/marseille-saint-joseph
```

---

## Custom Hooks

### useHospitals()

Hook pour récupérer et filtrer les hôpitaux.

```typescript
function useHospitals(filters?: { status?: HospitalStatus[]; beforeDate?: string }): {
  data: Hospital[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
```

**Usage:**

```typescript
import { useHospitals } from '@/app/store/useQueryHooks';

function HospitalList() {
  const { data: hospitals, isLoading, error } = useHospitals({
    status: ['deployed'],
    beforeDate: '2025-01-01',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {hospitals?.map(hospital => (
        <li key={hospital.id}>{hospital.name}</li>
      ))}
    </ul>
  );
}
```

### useGeolocation()

Hook pour obtenir la position de l'utilisateur.

```typescript
function useGeolocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  requestPermission: () => void;
};
```

**Usage:**

```typescript
import { useGeolocation } from '@/app/hooks/useGeolocation';

function LocationButton() {
  const { position, error, loading, requestPermission } = useGeolocation();

  return (
    <button onClick={requestPermission} disabled={loading}>
      {loading ? 'Locating...' : 'Find My Location'}
    </button>
  );
}
```

### useMapbox()

Hook pour gérer l'instance Mapbox.

```typescript
function useMapbox(): {
  mapboxgl: typeof mapboxgl | null;
  isLoaded: boolean;
  error: Error | null;
};
```

---

## Utility Functions

### Date Utils

```typescript
// app/utils/date-utils.ts

/**
 * Format une date en format local
 */
export function formatDate(date: Date | string, locale = 'fr-FR'): string;

/**
 * Parse une date ISO 8601
 */
export function parseDate(dateString: string): Date;

/**
 * Vérifie si une date est avant une autre
 */
export function isBeforeDate(date1: Date | string, date2: Date | string): boolean;
```

### Export Utils

```typescript
// app/utils/export-utils.ts

/**
 * Exporte les données en PDF
 */
export async function exportToPDF(hospitals: Hospital[]): Promise<void>;

/**
 * Exporte les données en Excel
 */
export async function exportToExcel(hospitals: Hospital[]): Promise<void>;

/**
 * Exporte les données en JSON
 */
export function exportToJSON(hospitals: Hospital[]): void;

/**
 * Exporte les données en CSV
 */
export function exportToCSV(hospitals: Hospital[]): void;
```

### Navigation Utils

```typescript
// app/utils/navigation-utils.ts

/**
 * Génère un lien Google Maps pour navigation
 */
export function getGoogleMapsLink(location: [number, number]): string;

/**
 * Génère un lien Apple Maps pour navigation
 */
export function getAppleMapsLink(location: [number, number]): string;

/**
 * Détecte la plateforme et retourne le lien approprié
 */
export function getNavigationLink(location: [number, number]): string;
```

### Share Utils

```typescript
// app/utils/share-utils.ts

/**
 * Partage via Web Share API
 */
export async function shareHospital(hospital: Hospital): Promise<void>;

/**
 * Génère un lien de partage email
 */
export function getEmailShareLink(hospital: Hospital): string;

/**
 * Génère un lien de partage Twitter
 */
export function getTwitterShareLink(hospital: Hospital): string;
```

---

## Store (Zustand)

### useMapStore

Store principal pour l'état de la carte.

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MapStore {
  // State
  selectedFilters: HospitalStatus[];
  selectedHospital: Hospital | null;
  currentTimelineDate: string | null;
  viewState: ViewState;

  // Actions
  setSelectedFilters: (filters: HospitalStatus[]) => void;
  setSelectedHospital: (hospital: Hospital | null) => void;
  setCurrentTimelineDate: (date: string | null) => void;
  setViewState: (state: Partial<ViewState>) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      set => ({
        // Implementation
      }),
      { name: 'map-store' }
    )
  )
);
```

**Usage:**

```typescript
import { useMapStore } from '@/app/store/useMapStore';

function FilterButton() {
  const { selectedFilters, setSelectedFilters } = useMapStore();

  const toggleFilter = (status: HospitalStatus) => {
    setSelectedFilters(
      selectedFilters.includes(status)
        ? selectedFilters.filter((f) => f !== status)
        : [...selectedFilters, status]
    );
  };

  return <button onClick={() => toggleFilter('deployed')}>Deployed</button>;
}
```

---

## Monitoring & Analytics

### Core Web Vitals Tracking

```typescript
// app/utils/analytics.ts

/**
 * Initialise le tracking des Web Vitals
 */
export function initWebVitals(): void;

/**
 * Track un événement personnalisé
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void;
```

### Sentry Error Tracking

```typescript
// app/utils/monitoring.ts

/**
 * Report une erreur de boundary React
 */
export function reportErrorBoundary(
  error: Error,
  errorInfo: { componentStack?: string | null }
): void;

/**
 * Track une issue d'accessibilité
 */
export function trackAccessibilityIssue(issue: {
  type: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  element: string;
  description: string;
  wcagCriteria?: string;
}): void;

/**
 * Track un événement utilisateur
 */
export function trackUserEngagement(event: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void;

/**
 * Track une interaction avec un hôpital
 */
export function trackHospitalInteraction(
  hospitalId: string,
  action: 'view' | 'favorite' | 'share' | 'navigate'
): void;

/**
 * Track une interaction avec la carte
 */
export function trackMapInteraction(
  action: 'zoom' | 'pan' | 'marker-click' | 'filter' | 'search'
): void;

/**
 * Track l'utilisation de l'export
 */
export function trackExport(format: 'pdf' | 'csv' | 'excel' | 'json'): void;

/**
 * Track une erreur API
 */
export function trackApiError(error: {
  endpoint: string;
  method: string;
  statusCode?: number;
  message: string;
}): void;
```

**Usage:**

```typescript
import { trackHospitalInteraction } from '@/app/utils/monitoring';

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const handleView = () => {
    trackHospitalInteraction(hospital.id, 'view');
    // ...
  };

  return <div onClick={handleView}>{hospital.name}</div>;
}
```

---

## Environment Variables

Variables d'environnement requises et optionnelles:

### Requises

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx
```

### Optionnelles

```bash
# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx
SENTRY_ORG=galeon
SENTRY_PROJECT=hospital-map

# Analytics
NEXT_PUBLIC_APP_VERSION=v0.2.0

# API
NEXT_PUBLIC_API_URL=https://api.galeon.community
```

---

## Error Handling

### ErrorBoundary Component

```typescript
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={reset}>Retry</button>
        </div>
      )}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

---

## Performance Optimization

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const MapComponent = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memo component
export const HospitalCard = memo(({ hospital }: { hospital: Hospital }) => {
  return <div>{hospital.name}</div>;
});

// Memo value
const filteredHospitals = useMemo(
  () => hospitals.filter((h) => h.status === 'deployed'),
  [hospitals]
);

// Memo callback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date-utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate(new Date('2025-01-15'))).toBe('15/01/2025');
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('should display hospitals', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="hospital-list"]')).toBeVisible();
});
```

---

## Support

Pour plus d'informations:

- **Repository:** https://github.com/galeon-community/hospital-map
- **Issues:** https://github.com/galeon-community/hospital-map/issues
- **Documentation:** https://docs.galeon.community

---

**Version:** 0.2.0
**Last Updated:** 2025-10-01
