# 🎯 PLAN D'ACTION COMPLET - GALEON COMMUNITY HOSPITAL MAP

**Date de création:** 2025-10-01
**Version:** 1.0
**Basé sur:** Audit complet du 2025-10-01
**Score actuel:** 7.2/10
**Score cible:** 9.0/10

---

## 📋 RÉSUMÉ EXÉCUTIF

Ce plan d'action détaillé découle de l'audit complet de l'application et propose **42 actions concrètes** réparties en 3 phases sur 3 mois pour améliorer la sécurité, la qualité et la robustesse de l'application.

### Objectifs Stratégiques

1. **Sécurité renforcée** - Éliminer toutes les vulnérabilités critiques
2. **Tests robustes** - Atteindre 70%+ de couverture de tests
3. **Performance optimale** - Maintenir Lighthouse score > 95
4. **Qualité code** - Améliorer la maintenabilité et la documentation

### Vue d'Ensemble des Phases

| Phase | Durée | Focus Principal | Actions | Effort |
|-------|-------|-----------------|---------|--------|
| **Phase 1** | Semaine 1-2 | 🔴 Critique | 12 actions | 40h |
| **Phase 2** | Semaine 3-6 | 🟡 Important | 18 actions | 80h |
| **Phase 3** | Semaine 7-12 | 🟢 Amélioration | 12 actions | 60h |
| **Total** | 3 mois | | **42 actions** | **180h** |

---

## 🔴 PHASE 1 - ACTIONS CRITIQUES (Semaine 1-2)

**Objectif:** Corriger les vulnérabilités de sécurité et mettre en place les fondations des tests

### 1.1 Sécurité Critique (Priorité MAX)

#### Action 1.1.1: Retirer le Token Mapbox Exposé
**Fichier:** `app/hooks/useMapbox.ts`
**Priorité:** 🔴 CRITIQUE
**Durée:** 30 minutes
**Effort:** ⚡ Facile

**Étapes:**
```bash
# 1. Retirer le token hardcodé
# Dans app/hooks/useMapbox.ts, ligne 40, remplacer par:
```

```typescript
// AVANT (VULNÉRABLE):
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
  'pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ';

// APRÈS (SÉCURISÉ):
const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  const errorMsg = 'Mapbox token is required. Set NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.';
  logger.error(errorMsg);
  setError(errorMsg);
  setIsLoading(false);
  return;
}
mapboxgl.accessToken = token;
```

**Actions complémentaires:**
```bash
# 2. Régénérer le token Mapbox
# - Se connecter sur https://account.mapbox.com/access-tokens/
# - Révoquer l'ancien token exposé: pk.eyJ1IjoiamVhbmJvbjkxIi...
# - Créer un nouveau token avec restrictions:
#   * URL restrictions: *.galeon.community, localhost:3000
#   * Scopes: styles:read, fonts:read, tiles:read

# 3. Mettre à jour les fichiers d'environnement
echo "NEXT_PUBLIC_MAPBOX_TOKEN=nouveau_token_ici" >> .env.local
echo "NEXT_PUBLIC_MAPBOX_TOKEN=nouveau_token_ici" >> .env.production

# 4. Ajouter au .env.example
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here" >> .env.example

# 5. Documenter dans le README
```

**Validation:**
- [ ] Token hardcodé supprimé du code
- [ ] Ancien token révoqué sur Mapbox
- [ ] Nouveau token créé avec restrictions
- [ ] Variables d'environnement mises à jour
- [ ] Application démarre sans erreur
- [ ] Map s'affiche correctement

**Critères de succès:**
- Aucun token visible dans le code source
- Application fonctionne en dev et prod
- Pas d'erreur console liée à Mapbox

---

#### Action 1.1.2: Renforcer la Content Security Policy
**Fichiers:** `public/_headers`, `next.config.mjs`
**Priorité:** 🔴 CRITIQUE
**Durée:** 2 heures
**Effort:** ⚡⚡ Moyen

**Étapes:**

```typescript
// 1. Créer un middleware pour générer des nonces
// Fichier: middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://api.mapbox.com https://events.mapbox.com;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://api.mapbox.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://api.mapbox.com https://events.mapbox.com;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

```typescript
// 2. Mettre à jour le layout pour utiliser le nonce
// Fichier: app/layout.tsx
import { headers } from 'next/headers';

export default function RootLayout({ children }) {
  const nonce = headers().get('x-nonce');

  return (
    <html lang="en">
      <head>
        {/* Scripts avec nonce */}
        <script nonce={nonce} type="application/ld+json" {...}>
          {/* Structured data */}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Validation:**
- [ ] CSP header sans unsafe-inline/unsafe-eval (sauf style temporairement)
- [ ] Nonce généré pour chaque requête
- [ ] Scripts inline fonctionnent avec nonce
- [ ] Aucune erreur CSP dans la console
- [ ] Test avec CSP Evaluator: https://csp-evaluator.withgoogle.com/

---

#### Action 1.1.3: Audit de Sécurité des Dépendances
**Priorité:** 🔴 CRITIQUE
**Durée:** 1 heure
**Effort:** ⚡ Facile

**Étapes:**
```bash
# 1. Audit npm
npm audit --production
npm audit fix

# 2. Vérifier les vulnérabilités critiques
npm audit --json > audit-report.json

# 3. Mettre à jour les packages avec vulnérabilités
npm update

# 4. Si des vulnérabilités persistent, forcer les résolutions
# Dans package.json:
{
  "overrides": {
    "package-vulnerable": "^version-safe"
  }
}

# 5. Installer Snyk pour monitoring continu (optionnel)
npm install -g snyk
snyk test
snyk monitor
```

**Validation:**
- [ ] Aucune vulnérabilité critique
- [ ] Vulnérabilités high corrigées ou documentées
- [ ] Rapport d'audit généré
- [ ] Plan de monitoring établi

---

### 1.2 Infrastructure de Tests (Priorité HAUTE)

#### Action 1.2.1: Configurer l'Environnement de Tests Complet
**Priorité:** 🔴 CRITIQUE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

**Étapes:**

```bash
# 1. Vérifier les dépendances de test
npm install --save-dev \
  @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest \
  @vitest/ui@latest \
  happy-dom@latest
```

```typescript
// 2. Créer un setup avancé
// Fichier: app/utils/__tests__/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock Mapbox GL
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(() => ({
    on: vi.fn(),
    remove: vi.fn(),
    addControl: vi.fn(),
    flyTo: vi.fn(),
    setStyle: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  Popup: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  })),
}));

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 100,
      },
    })
  ),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true,
});

// Mock Window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

```typescript
// 3. Créer des utilitaires de test réutilisables
// Fichier: app/utils/__tests__/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration i18n pour tests
i18n.load('en', {});
i18n.activate('en');

// QueryClient pour tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Provider wrapper pour tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    </QueryClientProvider>
  );
};

// Render personnalisé avec providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**Validation:**
- [ ] Tous les mocks fonctionnent
- [ ] Tests peuvent s'exécuter sans erreur
- [ ] Coverage configuré
- [ ] UI Vitest accessible

---

#### Action 1.2.2: Tests du Store Zustand
**Fichier:** `app/store/__tests__/useMapStore.test.ts`
**Priorité:** 🔴 CRITIQUE
**Durée:** 4 heures
**Effort:** ⚡⚡⚡ Complexe

**Étapes:**

```typescript
// Créer app/store/__tests__/useMapStore.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMapStore } from '../useMapStore';
import { Hospital, HospitalStatus } from '../../types';

// Mock hospitals
const mockHospitals: Hospital[] = [
  {
    id: '1',
    nameEn: 'Hospital A',
    nameFr: 'Hôpital A',
    deploymentDate: '2024-01-15',
    status: 'Deployed' as HospitalStatus,
    coordinates: { lat: 48.8566, lng: 2.3522 },
    address: '123 Rue de Paris',
    website: 'https://hospital-a.com',
  },
  {
    id: '2',
    nameEn: 'Hospital B',
    nameFr: 'Hôpital B',
    deploymentDate: '2024-03-20',
    status: 'Signed' as HospitalStatus,
    coordinates: { lat: 45.764, lng: 4.8357 },
    address: '456 Rue de Lyon',
    website: 'https://hospital-b.com',
  },
];

describe('useMapStore', () => {
  beforeEach(() => {
    // Reset store avant chaque test
    useMapStore.setState({
      hospitals: [],
      filteredHospitals: [],
      currentDate: '2024-01-01',
      selectedFilters: { deployed: true, signed: true },
      searchTerm: '',
      language: 'en',
      selectedHospital: null,
      isLoading: false,
      error: null,
      hydrated: false,
      timelineIndex: 0,
      timelineLength: 0,
    });
  });

  describe('Initialisation', () => {
    it('devrait avoir les valeurs par défaut correctes', () => {
      const { result } = renderHook(() => useMapStore());

      expect(result.current.hospitals).toEqual([]);
      expect(result.current.filteredHospitals).toEqual([]);
      expect(result.current.language).toBe('en');
      expect(result.current.selectedFilters).toEqual({
        deployed: true,
        signed: true,
      });
    });
  });

  describe('Actions de base', () => {
    it('devrait mettre à jour la liste des hôpitaux', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHospitals(mockHospitals);
      });

      expect(result.current.hospitals).toHaveLength(2);
      expect(result.current.hospitals[0].nameEn).toBe('Hospital A');
    });

    it('devrait mettre à jour la date courante', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2024-02-15');
      });

      expect(result.current.currentDate).toBe('2024-02-15');
    });

    it('devrait basculer les filtres', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.toggleFilter('deployed');
      });

      expect(result.current.selectedFilters.deployed).toBe(false);
      expect(result.current.selectedFilters.signed).toBe(true);
    });
  });

  describe('Filtrage des hôpitaux', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useMapStore());
      act(() => {
        result.current.setHospitals(mockHospitals);
      });
    });

    it('devrait filtrer par date correctement', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2024-01-20');
      });

      // Seulement Hospital A devrait être visible (déployé avant 2024-01-20)
      expect(result.current.filteredHospitals).toHaveLength(1);
      expect(result.current.filteredHospitals[0].id).toBe('1');
    });

    it('devrait filtrer par statut correctement', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2024-12-31');
        result.current.toggleFilter('signed'); // Désactiver "signed"
      });

      // Seulement les hôpitaux "Deployed" devraient être visibles
      const deployedOnly = result.current.filteredHospitals.filter(
        h => h.status === 'Deployed'
      );
      expect(deployedOnly).toHaveLength(1);
    });

    it('devrait filtrer par terme de recherche', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2024-12-31');
        result.current.setSearchTerm('Hospital A');
      });

      expect(result.current.filteredHospitals).toHaveLength(1);
      expect(result.current.filteredHospitals[0].nameEn).toBe('Hospital A');
    });

    it('devrait appliquer plusieurs filtres simultanément', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setCurrentDate('2024-12-31');
        result.current.toggleFilter('signed');
        result.current.setSearchTerm('Paris');
      });

      expect(result.current.filteredHospitals).toHaveLength(1);
      expect(result.current.filteredHospitals[0].address).toContain('Paris');
    });
  });

  describe('Gestion du langage', () => {
    it('devrait changer de langue', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.setLanguage('fr');
      });

      expect(result.current.language).toBe('fr');
    });
  });

  describe('fetchHospitals', () => {
    it('devrait charger les hôpitaux avec succès', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.fetchHospitals();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hospitals.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });

    it('devrait définir la date initiale à la date de déploiement la plus ancienne', async () => {
      const { result } = renderHook(() => useMapStore());

      await act(async () => {
        await result.current.fetchHospitals();
      });

      // La date devrait être celle du premier hôpital déployé
      const dates = result.current.hospitals.map(h => h.deploymentDate).sort();
      expect(result.current.currentDate).toBe(dates[0]);
    });
  });
});
```

**Validation:**
- [ ] Au moins 15 tests unitaires passent
- [ ] Couverture du store > 80%
- [ ] Tous les edge cases testés
- [ ] Tests rapides (< 5s total)

---

#### Action 1.2.3: Tests des Hooks Critiques
**Fichiers:** `app/hooks/__tests__/useMapbox.test.ts`, `app/hooks/__tests__/useGeolocation.test.ts`
**Priorité:** 🔴 HAUTE
**Durée:** 4 heures
**Effort:** ⚡⚡⚡ Complexe

**Étapes:**

```typescript
// Fichier: app/hooks/__tests__/useMapbox.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMapbox } from '../useMapbox';

describe('useMapbox', () => {
  it('devrait charger la bibliothèque Mapbox avec succès', async () => {
    const { result } = renderHook(() => useMapbox());

    // Vérifier l'état initial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.mapboxgl).toBeNull();

    // Attendre le chargement
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mapboxgl).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer les erreurs de chargement', async () => {
    // Mock d'une erreur de chargement
    // Note: Nécessite de mocker window.document.createElement

    const { result } = renderHook(() => useMapbox());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Dans un contexte d'erreur, error devrait être défini
  });

  it('devrait définir le token d\'accès Mapbox', async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test_token';

    const { result } = renderHook(() => useMapbox());

    await waitFor(() => {
      expect(result.current.mapboxgl).toBeDefined();
    });

    // Vérifier que le token est défini (si accessible)
  });
});
```

```typescript
// Fichier: app/hooks/__tests__/useGeolocation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  beforeEach(() => {
    // Reset les mocks
    vi.clearAllMocks();
  });

  it('devrait obtenir la position de l\'utilisateur', async () => {
    const mockPosition = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 100,
      },
    };

    navigator.geolocation.getCurrentPosition = vi.fn((success) =>
      success(mockPosition as any)
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      result.current.getLocation();
    });

    // Vérifier que la position est récupérée
    expect(result.current.position).toEqual({
      lat: 48.8566,
      lng: 2.3522,
    });
  });

  it('devrait gérer les erreurs de permission refusée', async () => {
    navigator.geolocation.getCurrentPosition = vi.fn((_, error) =>
      error({ code: 1, message: 'Permission denied' } as any)
    );

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      result.current.getLocation();
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

**Validation:**
- [ ] Tests useMapbox: 3+ tests passent
- [ ] Tests useGeolocation: 3+ tests passent
- [ ] Mocks Mapbox fonctionnent correctement
- [ ] Edge cases couverts

---

### 1.3 Documentation Critique

#### Action 1.3.1: Documenter le Processus de Sécurité
**Fichier:** `SECURITY.md`
**Priorité:** 🔴 HAUTE
**Durée:** 2 heures
**Effort:** ⚡⚡ Moyen

**Contenu à créer:**

```markdown
# Politique de Sécurité

## Rapporter une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, **ne créez PAS d'issue publique**.

Contactez-nous directement:
- **Email:** security@galeon.community
- **PGP Key:** [Lien vers clé publique]

## Vulnérabilités Supportées

Nous prenons en charge activement la sécurité pour:
- Version actuelle (0.2.x)
- Version précédente (0.1.x) - corrections critiques uniquement

## Processus de Réponse

1. **Accusé de réception** - Sous 24h
2. **Évaluation** - Sous 3 jours ouvrables
3. **Correction** - Selon la sévérité:
   - Critique: < 48h
   - Haute: < 1 semaine
   - Moyenne: < 2 semaines
4. **Notification** - Après déploiement du correctif

## Bonnes Pratiques de Sécurité

### Variables d'Environnement

- ✅ Ne JAMAIS committer les fichiers `.env`
- ✅ Utiliser `.env.example` pour la documentation
- ✅ Rotation des tokens tous les 3 mois
- ✅ Tokens avec restrictions d'URL/scope minimales

### Dépendances

- Audit hebdomadaire: `npm audit`
- Mise à jour mensuelle des dépendances critiques
- Monitoring continu avec Snyk ou Dependabot

### Content Security Policy

- Pas de `unsafe-inline` ou `unsafe-eval`
- Nonces pour tous les scripts inline
- Liste blanche stricte des domaines externes

### Headers HTTP

Tous les headers de sécurité doivent être configurés:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy
- Referrer-Policy

## Audit de Sécurité

- **Fréquence:** Trimestrielle
- **Dernier audit:** 2025-10-01
- **Prochain audit:** 2026-01-01
- **Rapport:** Disponible sur demande

## Conformité

- RGPD: Données utilisateur minimales (geolocation uniquement)
- OWASP Top 10: Révision annuelle
- CSP Level 3: Implémenté

## Contacts

- **Équipe Sécurité:** security@galeon.community
- **Responsable Technique:** tech-lead@galeon.community
```

**Validation:**
- [ ] Fichier SECURITY.md créé
- [ ] Process de signalement clair
- [ ] Engagement de réponse défini
- [ ] Bonnes pratiques documentées

---

### Récapitulatif Phase 1

**Résultats attendus:**
- ✅ Toutes les vulnérabilités critiques corrigées
- ✅ Infrastructure de tests opérationnelle
- ✅ 20+ tests unitaires créés
- ✅ Documentation sécurité en place
- ✅ Score sécurité: 6.5 → 8.5/10

**Checklist de validation Phase 1:**
- [ ] Token Mapbox sécurisé et révoqué
- [ ] CSP renforcée sans unsafe-*
- [ ] Audit npm sans vulnérabilités critiques
- [ ] Setup tests complet fonctionnel
- [ ] Tests store (15+ tests) passent
- [ ] Tests hooks (6+ tests) passent
- [ ] Fichier SECURITY.md publié
- [ ] Build production réussit
- [ ] Application déployée et testée

---

## 🟡 PHASE 2 - ACTIONS IMPORTANTES (Semaine 3-6)

**Objectif:** Augmenter la couverture de tests et améliorer la qualité du code

### 2.1 Tests des Composants UI (Semaine 3)

#### Action 2.1.1: Tests du Composant Map
**Fichier:** `app/components/__tests__/Map.test.tsx`
**Priorité:** 🟡 HAUTE
**Durée:** 6 heures
**Effort:** ⚡⚡⚡ Complexe

#### Action 2.1.2: Tests HospitalDetail
**Fichier:** `app/components/__tests__/HospitalDetail.test.tsx`
**Priorité:** 🟡 HAUTE
**Durée:** 4 heures
**Effort:** ⚡⚡ Moyen

#### Action 2.1.3: Tests ActionBar
**Fichier:** `app/components/__tests__/ActionBar.test.tsx`
**Priorité:** 🟡 MOYENNE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

#### Action 2.1.4: Tests TimelineControl
**Fichier:** `app/components/__tests__/TimelineControl.test.tsx`
**Priorité:** 🟡 MOYENNE
**Durée:** 4 heures
**Effort:** ⚡⚡⚡ Complexe

**Objectif cumulé:** 30+ tests de composants, couverture composants > 60%

---

### 2.2 Tests E2E Complets (Semaine 4)

#### Action 2.2.1: Tests d'Export (PDF, Excel, JSON)
**Fichier:** `e2e/export-features.spec.ts`
**Priorité:** 🟡 HAUTE
**Durée:** 5 heures
**Effort:** ⚡⚡⚡ Complexe

```typescript
// e2e/export-features.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Export Features', () => {
  test('devrait exporter en PDF', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[aria-label="Export"]'),
      page.click('text=PDF'),
    ]);

    expect(download.suggestedFilename()).toContain('galeon-hospitals');
    expect(download.suggestedFilename()).toContain('.pdf');

    // Vérifier que le fichier n'est pas vide
    const path = await download.path();
    const fs = require('fs');
    const stats = fs.statSync(path);
    expect(stats.size).toBeGreaterThan(1000); // > 1KB
  });

  test('devrait exporter en Excel', async ({ page }) => {
    await page.goto('/');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[aria-label="Export"]'),
      page.click('text=Excel'),
    ]);

    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('devrait exporter en JSON', async ({ page }) => {
    await page.goto('/');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[aria-label="Export"]'),
      page.click('text=JSON'),
    ]);

    expect(download.suggestedFilename()).toContain('.json');

    // Vérifier que c'est un JSON valide
    const content = await download.path().then(p =>
      require('fs').readFileSync(p, 'utf-8')
    );
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
```

#### Action 2.2.2: Tests de Timeline
**Fichier:** `e2e/timeline.spec.ts`
**Priorité:** 🟡 HAUTE
**Durée:** 4 heures
**Effort:** ⚡⚡⚡ Complexe

#### Action 2.2.3: Tests de Partage Social
**Fichier:** `e2e/share-features.spec.ts`
**Priorité:** 🟡 MOYENNE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

#### Action 2.2.4: Tests Multi-Navigateurs
**Configuration:** `playwright.config.ts`
**Priorité:** 🟡 MOYENNE
**Durée:** 2 heures
**Effort:** ⚡ Facile

```typescript
// playwright.config.ts - Ajouter:
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 12'] },
  },
],
```

**Objectif:** 15+ tests E2E, tous les navigateurs testés

---

### 2.3 Qualité du Code (Semaine 5)

#### Action 2.3.1: Créer des Constantes pour Magic Numbers
**Fichier:** `app/utils/constants.ts`
**Priorité:** 🟡 MOYENNE
**Durée:** 2 heures
**Effort:** ⚡ Facile

```typescript
// app/utils/constants.ts
export const LAYOUT = {
  SIDEBAR_WIDTH: 320,
  SIDEBAR_WIDTH_MOBILE: 280,
  TIMELINE_HEIGHT: 52,
  MAP_CONTROLS_OFFSET: 10,
  HEADER_HEIGHT: 64,
} as const;

export const TIMING = {
  INITIALIZATION_DELAY: 500,
  RETRY_DELAY: 2000,
  TOAST_DURATION: 3000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION_DURATION: 300,
} as const;

export const LIMITS = {
  EXPORT_PER_MINUTE: 5,
  API_REQUESTS_PER_MINUTE: 100,
  MAX_SEARCH_LENGTH: 100,
  MAX_HOSPITALS_DISPLAY: 1000,
} as const;

export const Z_INDEX = {
  TIMELINE: 20,
  SIDEBAR: 10,
  ACTION_BAR: 30,
  MODAL: 50,
  TOOLTIP: 60,
  MAX: 9999,
} as const;
```

**Ensuite:** Remplacer tous les magic numbers dans les composants

**Validation:**
- [ ] Fichier constants.ts créé
- [ ] Au moins 20+ constantes définies
- [ ] Tous les composants mis à jour
- [ ] Aucun magic number restant dans le code

---

#### Action 2.3.2: Typer les Traductions
**Fichier:** `app/types/translations.ts`
**Priorité:** 🟡 MOYENNE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

```typescript
// app/types/translations.ts
export type TranslationKey =
  // Navigation
  | 'Hospital Name'
  | 'Status'
  | 'Deployed'
  | 'Signed'
  | 'Deployment Date'
  | 'Address'
  | 'Website'
  // Actions
  | 'Export'
  | 'Share'
  | 'Geolocate'
  | 'Enter fullscreen'
  | 'Exit fullscreen'
  // Filters
  | 'Filter by status'
  | 'Search hospitals'
  | 'Show deployed'
  | 'Show signed'
  // Messages
  | 'Loading'
  | 'Error loading hospitals'
  | 'No hospitals found'
  | 'Location marker removed'
  | 'Geolocation error'
  // Exports
  | 'Export PDF'
  | 'Export Excel'
  | 'Export JSON'
  | 'Export successful'
  | 'Export failed';

// Fonction typée pour les traductions
export function translate(key: TranslationKey, i18n: any): string {
  return i18n._(key);
}
```

**Validation:**
- [ ] Tous les textes UI typés
- [ ] Aucune string hardcodée non typée
- [ ] IDE autocomplete fonctionne
- [ ] Compilation réussit

---

#### Action 2.3.3: Implémenter Error Boundaries
**Fichier:** `app/components/ErrorBoundary.tsx`
**Priorité:** 🟡 HAUTE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

```typescript
// app/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optionnel: Envoyer à un service de monitoring
    // sendToErrorTracking(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              {this.state.error.message}
            </p>
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Fallback spécialisé pour les features
export const FeatureErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    <p className="text-red-800 mb-2">Feature unavailable</p>
    <p className="text-sm text-red-600">{error.message}</p>
    <button
      onClick={reset}
      className="mt-2 text-sm text-red-700 underline"
    >
      Retry
    </button>
  </div>
);
```

**Utilisation:**

```tsx
// app/layout.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Pour une feature spécifique:
<ErrorBoundary fallback={FeatureErrorFallback}>
  <Map />
</ErrorBoundary>
```

**Validation:**
- [ ] ErrorBoundary implémenté
- [ ] Fallback UI testé
- [ ] Logs d'erreur fonctionnent
- [ ] Recovery après erreur possible

---

#### Action 2.3.4: Nettoyer useQueryHooks.ts
**Fichier:** `app/store/useQueryHooks.ts`
**Priorité:** 🟡 BASSE
**Durée:** 30 minutes
**Effort:** ⚡ Facile

**Options:**

**Option A: Supprimer** (recommandé si non utilisé)
```bash
rm app/store/useQueryHooks.ts
# Vérifier qu'aucune import ne référence ce fichier
```

**Option B: Intégrer avec Zustand**
```typescript
// Utiliser React Query pour la synchro serveur future
// Garder Zustand pour l'état local
// Créer un bridge entre les deux
```

**Validation:**
- [ ] Décision prise et documentée
- [ ] Fichier supprimé OU intégré
- [ ] Aucune import cassée
- [ ] Build réussit

---

### 2.4 Performance et Monitoring (Semaine 6)

#### Action 2.4.1: Implémenter Web Vitals Monitoring
**Fichier:** `app/utils/analytics.ts`
**Priorité:** 🟡 HAUTE
**Durée:** 4 heures
**Effort:** ⚡⚡ Moyen

```typescript
// app/utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Fonction pour envoyer les métriques
function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Option 1: Cloudflare Analytics (via beacon)
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
  } else {
    // Fallback: fetch
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }

  // Option 2: Console en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
  }
}

// Initialiser le monitoring
export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Custom metrics
export function trackCustomMetric(name: string, value: number) {
  sendToAnalytics({
    name,
    value,
    rating: 'good',
    delta: value,
    id: crypto.randomUUID(),
    navigationType: 'navigate',
  } as Metric);
}
```

```typescript
// app/page.tsx - Ajouter:
import { useEffect } from 'react';
import { initWebVitals } from './utils/analytics';

export default function Home() {
  useEffect(() => {
    initWebVitals();
  }, []);

  // ...
}
```

```typescript
// .cloudflare/workers-site/index.js - API endpoint:
export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.url.endsWith('/api/analytics')) {
    try {
      const metrics = await request.json();

      // Stocker dans Cloudflare Analytics ou D1
      await env.ANALYTICS.writeDataPoint({
        blobs: [metrics.name, metrics.url],
        doubles: [metrics.value],
        indexes: [metrics.timestamp],
      });

      return new Response('OK', { status: 200 });
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  }
}
```

**Validation:**
- [ ] Web Vitals collectés
- [ ] Métriques envoyées à l'API
- [ ] Dashboard Cloudflare configuré
- [ ] Alertes sur dégradation configurées

---

#### Action 2.4.2: Service Worker pour Offline
**Fichier:** `public/sw.js` (déjà existant, à activer)
**Priorité:** 🟡 MOYENNE
**Durée:** 3 heures
**Effort:** ⚡⚡ Moyen

```typescript
// app/components/ServiceWorker.tsx - Améliorer:
'use client';

import { useEffect } from 'react';
import logger from '../utils/logger';

export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered:', registration.scope);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  logger.info('New version available');

                  // Optionnel: Notifier l'utilisateur
                  if (confirm('A new version is available. Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          logger.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

```javascript
// public/sw.js - Améliorer la stratégie de cache:
const CACHE_NAME = 'galeon-hospitals-v1';
const RUNTIME_CACHE = 'galeon-runtime';

// Ressources à précacher
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/logo-white.svg',
  '/manifest.json',
];

// Installation - Précacher les ressources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch - Stratégie Network First avec fallback Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response before caching
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fallback to offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});
```

**Validation:**
- [ ] Service Worker enregistré
- [ ] Ressources critiques précachées
- [ ] Mode offline fonctionne
- [ ] Page offline.html affichée correctement

---

#### Action 2.4.3: Activer Bundle Analyzer
**Configuration:** `next.config.mjs`
**Priorité:** 🟡 MOYENNE
**Durée:** 1 heure
**Effort:** ⚡ Facile

```bash
# Installer le plugin
npm install --save-dev @next/bundle-analyzer

# Analyser le bundle
ANALYZE=true npm run build

# Examiner les résultats dans .next/analyze/
```

**Actions après analyse:**
- Identifier les packages trop lourds
- Vérifier le tree-shaking
- Optimiser les chunks

**Validation:**
- [ ] Bundle analyzer exécuté
- [ ] Rapport généré et examiné
- [ ] Actions d'optimisation identifiées
- [ ] Bundle total < 300KB (gzipped)

---

### Récapitulatif Phase 2

**Résultats attendus:**
- ✅ 50+ tests totaux (unitaires + E2E + intégration)
- ✅ Couverture globale > 60%
- ✅ Code quality améliorée (constants, types, error boundaries)
- ✅ Web Vitals monitoring actif
- ✅ Service Worker fonctionnel
- ✅ Score qualité: 8.0 → 9.0/10

**Checklist de validation Phase 2:**
- [ ] 30+ tests composants UI passent
- [ ] 15+ tests E2E passent sur tous les navigateurs
- [ ] Magic numbers tous remplacés par constantes
- [ ] Traductions toutes typées
- [ ] Error Boundaries implémentés
- [ ] Web Vitals collectés
- [ ] Service Worker activé
- [ ] Bundle optimisé < 300KB

---

## 🟢 PHASE 3 - AMÉLIORATIONS (Semaine 7-12)

**Objectif:** Finaliser les optimisations et préparer la production

### 3.1 Optimisations Avancées

#### Action 3.1.1: Implémenter Feature Flags
**Fichier:** `app/config/features.ts`
**Durée:** 2 heures

#### Action 3.1.2: Ajouter Preload pour Polices
**Fichiers:** `app/layout.tsx`, `next.config.mjs`
**Durée:** 1 heure

#### Action 3.1.3: Optimiser Images avec Sharp
**Configuration:** `next.config.mjs`
**Durée:** 2 heures

#### Action 3.1.4: Implémenter Code Splitting Avancé
**Fichiers:** Tous les composants lourds
**Durée:** 4 heures

---

### 3.2 CI/CD et Automatisation

#### Action 3.2.1: GitHub Actions pour Tests
**Fichier:** `.github/workflows/ci.yml`
**Priorité:** 🟢 HAUTE
**Durée:** 4 heures
**Effort:** ⚡⚡ Moyen

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test -- --run --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.NEXT_PUBLIC_MAPBOX_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: out/

  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --production --audit-level=high

      - name: Run Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Validation:**
- [ ] Workflow CI créé
- [ ] Tests automatiques fonctionnent
- [ ] Coverage uploadé vers Codecov
- [ ] Security checks passent

---

#### Action 3.2.2: Dependabot Configuration
**Fichier:** `.github/dependabot.yml`
**Durée:** 30 minutes

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "tech-team"
    labels:
      - "dependencies"
    versioning-strategy: "increase-if-necessary"
    ignore:
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]
```

---

#### Action 3.2.3: Pre-commit Hooks avec Husky
**Fichier:** `.husky/pre-commit`
**Durée:** 1 heure

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type check
echo "📝 TypeScript type checking..."
npm run type-check || {
  echo "❌ Type check failed. Please fix type errors."
  exit 1
}

# Lint
echo "🎨 Linting code..."
npm run lint || {
  echo "❌ Lint failed. Please fix linting errors."
  exit 1
}

# Unit tests (quick)
echo "🧪 Running unit tests..."
npm test -- --run --changed || {
  echo "❌ Tests failed. Please fix failing tests."
  exit 1
}

echo "✅ All pre-commit checks passed!"
```

---

### 3.3 Documentation Complète

#### Action 3.3.1: Architecture Decision Records (ADR)
**Dossier:** `docs/adr/`
**Durée:** 6 heures

```markdown
# ADR 001: Utilisation de Zustand pour la Gestion d'État

## Statut
Accepté

## Contexte
L'application nécessite une gestion d'état globale pour:
- La liste des hôpitaux
- Les filtres actifs
- La date courante de la timeline
- La langue de l'interface

## Décision
Utiliser Zustand au lieu de Redux ou Context API.

## Conséquences

### Positives
- API simple et minimaliste
- Performance excellente
- Pas de boilerplate
- DevTools intégrés
- Persist middleware facile

### Négatives
- Moins de middlewares disponibles que Redux
- Communauté plus petite

## Alternatives Considérées
1. **Redux Toolkit**: Trop de boilerplate pour nos besoins
2. **Context API**: Performance insuffisante avec de nombreux re-renders
3. **Jotai**: Moins mature que Zustand
```

Créer des ADR pour:
- Choix de Next.js 15
- Export statique vs SSR
- Mapbox vs Google Maps
- Lingui vs react-i18next
- Vitest vs Jest
- Cloudflare Pages vs Vercel

---

#### Action 3.3.2: Guide de Contribution
**Fichier:** `CONTRIBUTING.md`
**Durée:** 3 heures

#### Action 3.3.3: API Documentation
**Fichier:** `docs/API.md`
**Durée:** 2 heures

---

### 3.4 Accessibilité Complète

#### Action 3.4.1: Audit WCAG 2.1
**Outil:** axe DevTools
**Durée:** 4 heures

#### Action 3.4.2: Skip Links
**Fichiers:** Composants de layout
**Durée:** 1 heure

#### Action 3.4.3: ARIA Live Regions
**Fichiers:** Composants avec updates dynamiques
**Durée:** 2 heures

#### Action 3.4.4: Focus Management
**Fichiers:** Tous les composants interactifs
**Durée:** 3 heures

---

### 3.5 Monitoring Production

#### Action 3.5.1: Sentry pour Error Tracking
**Configuration:** Sentry SDK
**Durée:** 3 heures

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### Action 3.5.2: Cloudflare Analytics
**Configuration:** Dashboard Cloudflare
**Durée:** 1 heure

#### Action 3.5.3: Real User Monitoring (RUM)
**Configuration:** Cloudflare RUM
**Durée:** 2 heures

---

### Récapitulatif Phase 3

**Résultats attendus:**
- ✅ CI/CD complet avec GitHub Actions
- ✅ Documentation exhaustive (ADR, CONTRIBUTING, API)
- ✅ Accessibilité WCAG 2.1 AA compliant
- ✅ Monitoring production actif (Sentry + Cloudflare)
- ✅ Score global: 9.0+/10

---

## 📊 SUIVI ET MESURE DU SUCCÈS

### KPIs Techniques

| Métrique | Actuel | Cible | Méthode de Mesure |
|----------|--------|-------|-------------------|
| **Tests Coverage** | 20% | 70%+ | Vitest coverage report |
| **Lighthouse Performance** | >90 | >95 | Chrome DevTools |
| **Lighthouse Accessibility** | ~85 | >95 | Chrome DevTools |
| **Lighthouse SEO** | ~90 | >95 | Chrome DevTools |
| **Bundle Size (JS)** | ~250KB | <200KB | Bundle analyzer |
| **Bundle Size (CSS)** | ~50KB | <30KB | Bundle analyzer |
| **Time to Interactive** | ~3s | <2.5s | Web Vitals |
| **Largest Contentful Paint** | ~2.8s | <2.5s | Web Vitals |
| **First Input Delay** | ~100ms | <100ms | Web Vitals |
| **Cumulative Layout Shift** | <0.1 | <0.1 | Web Vitals |
| **Build Time** | ~7s | <5s | CI logs |
| **Vulnérabilités npm** | 5 | 0 | npm audit |

### KPIs Qualité

| Métrique | Actuel | Cible | Méthode |
|----------|--------|-------|---------|
| **Score Sécurité** | 6.5/10 | 9/10 | Audit manuel |
| **Score Performance** | 8.5/10 | 9/10 | Audit manuel |
| **Score Qualité Code** | 8/10 | 9/10 | Audit manuel |
| **Score Architecture** | 9/10 | 9/10 | Audit manuel |
| **Score Tests** | 4/10 | 8/10 | Audit manuel |
| **Score Accessibilité** | 7/10 | 9/10 | Audit manuel |
| **TypeScript Strictness** | 8/10 | 9/10 | tsconfig analysis |
| **Documentation Coverage** | 30% | 80% | Manuel |

### Rapports Hebdomadaires

**Template de rapport:**

```markdown
# Rapport Hebdomadaire - Semaine X

## Actions Complétées
- [ ] Action 1.1.1: Token Mapbox sécurisé ✅
- [ ] Action 1.1.2: CSP renforcée ✅
- ...

## Métriques Actuelles
- Tests Coverage: 35% (+15%)
- Lighthouse Score: 92 (+2)
- Vulnérabilités: 2 (-3)

## Blocages
- Aucun

## Plan Semaine Prochaine
- Action 2.1.1: Tests Map component
- Action 2.1.2: Tests HospitalDetail
- ...
```

---

## 🗓️ CALENDRIER DÉTAILLÉ

### Semaine 1 (Critique)
**Lun-Mar:** Actions 1.1.1 à 1.1.3 (Sécurité)
**Mer-Jeu:** Action 1.2.1 (Setup tests)
**Ven:** Action 1.2.2 (Tests store)

### Semaine 2 (Critique)
**Lun-Mar:** Action 1.2.3 (Tests hooks)
**Mer-Jeu:** Action 1.3.1 (Doc sécurité)
**Ven:** Review Phase 1 + Validation

### Semaine 3 (Important)
**Lun-Ven:** Actions 2.1.1 à 2.1.4 (Tests composants UI)

### Semaine 4 (Important)
**Lun-Ven:** Actions 2.2.1 à 2.2.4 (Tests E2E complets)

### Semaine 5 (Important)
**Lun-Mer:** Actions 2.3.1 à 2.3.4 (Qualité code)
**Jeu-Ven:** Actions 2.4.1 à 2.4.2 (Performance)

### Semaine 6 (Important)
**Lun-Mar:** Action 2.4.3 (Bundle analyzer)
**Mer-Ven:** Review Phase 2 + Validation

### Semaines 7-12 (Amélioration)
**Semaine 7:** Optimisations avancées (3.1.x)
**Semaine 8:** CI/CD (3.2.x)
**Semaine 9:** Documentation (3.3.x)
**Semaine 10:** Accessibilité (3.4.x)
**Semaine 11:** Monitoring (3.5.x)
**Semaine 12:** Final Review + Production Release

---

## 💰 ESTIMATION DES RESSOURCES

### Effort Total par Phase

| Phase | Heures Dev | Heures QA | Total | Coût Estimé* |
|-------|------------|-----------|-------|--------------|
| Phase 1 | 32h | 8h | 40h | 4000€ |
| Phase 2 | 64h | 16h | 80h | 8000€ |
| Phase 3 | 48h | 12h | 60h | 6000€ |
| **Total** | **144h** | **36h** | **180h** | **18000€** |

*Basé sur un taux de 100€/h (développeur senior)

### Ressources Nécessaires

**Équipe recommandée:**
- 1 Développeur Senior (lead technique)
- 1 Développeur Intermédiaire (implémentation)
- 0.5 QA Engineer (tests, validation)
- 0.25 DevOps (CI/CD, déploiement)

**Outils requis:**
- GitHub Actions (gratuit pour projets publics)
- Codecov (gratuit pour projets open source)
- Sentry (plan Free ou Business ~26€/mois)
- Snyk (plan Free ou Pro ~52€/mois)

---

## 🚨 GESTION DES RISQUES

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Breaking changes Mapbox | Élevé | Faible | Version pinning, tests E2E |
| Tests flaky | Moyen | Moyenne | Retry logic, mocks stables |
| Régression performance | Élevé | Faible | Web Vitals monitoring, alertes |
| Dépendances obsolètes | Moyen | Moyenne | Dependabot, audits réguliers |
| Dépassement délais | Moyen | Moyenne | Buffer 20%, priorisation stricte |
| Manque de ressources | Élevé | Faible | Plan B avec scope réduit |

### Plan de Contingence

**Si dépassement de délai Phase 1:**
- Reporter tests hooks (1.2.3) à Phase 2
- Garder seulement sécurité critique

**Si dépassement de délai Phase 2:**
- Reporter tests E2E multi-navigateurs
- Focus sur tests unitaires uniquement

**Si dépassement de délai Phase 3:**
- Phase 3 est optionnelle (amélioration)
- Prioriser CI/CD et monitoring uniquement

---

## ✅ CHECKLIST DE VALIDATION FINALE

### Avant Production

**Sécurité:**
- [ ] Aucune vulnérabilité critique ou haute
- [ ] Tous les secrets externalisés (.env)
- [ ] CSP stricte sans unsafe-*
- [ ] Headers de sécurité configurés
- [ ] HTTPS forcé partout
- [ ] Rate limiting actif

**Tests:**
- [ ] Coverage > 70%
- [ ] Tous les tests CI passent
- [ ] Tests E2E sur 3+ navigateurs
- [ ] Tests de régression passent
- [ ] Tests de charge effectués

**Performance:**
- [ ] Lighthouse Performance > 95
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle JS < 200KB (gzipped)
- [ ] Service Worker actif

**Qualité:**
- [ ] TypeScript compile sans erreur
- [ ] ESLint passe sans warning
- [ ] Prettier appliqué partout
- [ ] Pas de console.log en prod
- [ ] Error Boundaries implémentés

**Documentation:**
- [ ] README à jour
- [ ] SECURITY.md publié
- [ ] CONTRIBUTING.md créé
- [ ] ADRs documentés
- [ ] API documentée

**Monitoring:**
- [ ] Sentry configuré
- [ ] Web Vitals collectés
- [ ] Cloudflare Analytics actif
- [ ] Alertes configurées
- [ ] Dashboard opérationnel

**Accessibilité:**
- [ ] WCAG 2.1 AA compliant
- [ ] Screen reader testé
- [ ] Navigation clavier OK
- [ ] Contraste couleurs OK

---

## 📞 CONTACTS ET RESPONSABILITÉS

### Équipe Projet

**Product Owner:** [Nom]
- Validation des priorités
- Décisions fonctionnelles

**Tech Lead:** [Nom]
- Architecture technique
- Review de code
- Décisions techniques critiques

**Développeur Senior:** [Nom]
- Implémentation Phase 1-2
- Mentorat développeur junior

**Développeur Intermédiaire:** [Nom]
- Implémentation Phase 2-3
- Tests

**QA Engineer:** [Nom]
- Validation tests
- Tests manuels
- Rapports de bugs

**DevOps:** [Nom]
- CI/CD
- Déploiement
- Monitoring

### Communication

**Réunions:**
- **Daily Standup:** Lun-Ven 9h00 (15min)
- **Sprint Planning:** Début de chaque phase (2h)
- **Retrospective:** Fin de chaque phase (1h)
- **Demo:** Fin de phase 1 et 2 (1h)

**Canaux:**
- **Urgent:** Téléphone / SMS
- **Questions techniques:** Slack #dev-galeon
- **Bugs:** GitHub Issues
- **Documentation:** Confluence / Notion

---

## 🎯 CONCLUSION

Ce plan d'action de 180 heures sur 3 mois transformera l'application Galeon Hospital Map d'un score de **7.2/10** à **9.0/10**.

**Priorités absolues:**
1. 🔴 Sécuriser le token Mapbox (30 min)
2. 🔴 Renforcer la CSP (2h)
3. 🔴 Créer 30+ tests unitaires (20h)
4. 🔴 Créer 15+ tests E2E (15h)

**Succès final mesurable:**
- ✅ Zéro vulnérabilité critique
- ✅ 70%+ de couverture de tests
- ✅ Lighthouse > 95 sur tous les scores
- ✅ Production-ready avec monitoring complet

**Prochaine étape immédiate:**
Commencer par l'Action 1.1.1 (retrait token Mapbox) - **AUJOURD'HUI**.

---

**Document créé le:** 2025-10-01
**Prochaine révision:** Fin de chaque phase
**Version:** 1.0

*Pour toute question sur ce plan d'action, contacter le Tech Lead.*
