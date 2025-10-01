# Sprint 2 - Roadmap vers l'Excellence (10/10)

**Date de Début**: 01 Octobre 2025
**Score Actuel**: 9.0/10
**Objectif**: **10/10** ✨
**Durée Estimée**: 6-8 heures

---

## 🎯 Vue d'Ensemble

### Score Actuel par Catégorie

| Catégorie         | Score Actuel | Objectif 10/10 | Écart | Priorité   |
| ----------------- | ------------ | -------------- | ----- | ---------- |
| **Accessibilité** | 9.5/10       | 10.0/10        | -0.5  | 🔴 Haute   |
| **Sécurité**      | 9.5/10       | 10.0/10        | -0.5  | 🟡 Moyenne |
| **Performance**   | 8.5/10       | 10.0/10        | -1.5  | 🔴 Haute   |
| **Documentation** | 9.5/10       | 10.0/10        | -0.5  | 🟢 Basse   |
| **Tests**         | 8.5/10       | 10.0/10        | -1.5  | 🔴 Haute   |
| **Code Quality**  | 8.5/10       | 10.0/10        | -1.5  | 🟡 Moyenne |
| **DevOps**        | 8.0/10       | 10.0/10        | -2.0  | 🟡 Moyenne |

**Moyenne**: 9.0/10 → **Objectif 10.0/10**

---

## 📋 Sprint 2 - Tâches Planifiées

### Phase 1: Tests E2E Accessibilité (2-3h) 🔴

**Objectif**: Valider automatiquement WCAG 2.1 avec Playwright + axe-core

#### Tâches

1. **Installer axe-core pour Playwright** (15min)

   ```bash
   npm install --save-dev @axe-core/playwright
   ```

2. **Créer tests E2E accessibilité** (1.5h)
   - `e2e/accessibility.spec.ts`
   - Tester page principale avec axe
   - Tester page détail hôpital
   - Tester navigation clavier
   - Tester lecteur d'écran (aria-live)

3. **Ajouter CI checks accessibilité** (30min)
   - Intégrer dans GitHub Actions
   - Fail si violations WCAG Level A
   - Warning si violations Level AA

4. **Documentation tests** (30min)
   - Guide exécution tests accessibilité
   - Interprétation résultats axe-core

**Impact Estimé**:

- Accessibilité: 9.5 → 10.0/10 (+0.5)
- Tests: 8.5 → 9.0/10 (+0.5)

---

### Phase 2: Optimisation Vendor Bundle (1.5h) 🔴

**Objectif**: Réduire vendor bundle de 484 KB à <350 KB

#### Analyse Actuelle

```
chunks/vendors-3a61008f8dd69b35.js   484 KB
```

#### Tâches

1. **Analyser bundle composition** (30min)

   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

   - Identifier packages volumineux
   - Repérer duplications
   - Trouver alternatives légères

2. **Tree-shaking et optimisations** (45min)
   - Importer modules spécifiques (lodash-es)
   - Remplacer libraries lourdes si possible
   - Configurer `sideEffects` dans package.json
   - Optimiser imports Mapbox

3. **Code splitting avancé** (15min)
   - Split vendor chunks par route
   - Lazy load libraries non critiques

**Impact Estimé**:

- Performance: 8.5 → 9.5/10 (+1.0)
- Vendor bundle: 484 KB → ~320 KB (-34%)

---

### Phase 3: Correction Tests TypeScript (1.5h) 🟡

**Objectif**: Corriger les 35 erreurs TypeScript dans les fichiers test

#### Erreurs à Corriger

**Fichier**: `app/components/__tests__/HospitalDetail.test.tsx`

- `toBeInTheDocument` not found (Vitest matchers)
- Mock Image component types

**Fichier**: `app/hooks/__tests__/useGeolocation.test.ts`

- `toJSON` missing in mock GeolocationPosition

**Fichiers**: Tests stores et utils

- Mock types incomplets
- `any` types à remplacer

#### Tâches

1. **Installer types Vitest manquants** (15min)

   ```bash
   npm install --save-dev @testing-library/jest-dom
   ```

2. **Corriger mocks TypeScript** (1h)
   - Typer tous les mocks correctement
   - Remplacer `any` par types stricts
   - Ajouter types manquants

3. **Valider tests** (15min)
   - Exécuter `npm test`
   - Vérifier 69/69 passing

**Impact Estimé**:

- Tests: 9.0 → 10.0/10 (+1.0)
- Code Quality: 8.5 → 9.0/10 (+0.5)

---

### Phase 4: Service Worker & Offline Support (1.5h) 🟡

**Objectif**: Activer support offline avec Service Worker

#### Tâches

1. **Configurer Workbox** (30min)

   ```bash
   npm install --save-dev workbox-webpack-plugin
   ```

   - Configurer dans `next.config.mjs`
   - Stratégies cache par type ressource

2. **Implémenter Service Worker** (45min)
   - Cache API responses (hospitals data)
   - Cache static assets (CSS, JS, images)
   - Strategy: NetworkFirst pour données, CacheFirst pour assets

3. **UI offline indicator** (15min)
   - Badge "Mode Hors Ligne" si offline
   - Toast notification lors reconnexion

**Impact Estimé**:

- Performance: 9.5 → 10.0/10 (+0.5)
- DevOps: 8.0 → 9.0/10 (+1.0)

---

### Phase 5: Monitoring & Analytics (1h) 🟡

**Objectif**: Améliorer monitoring production

#### Tâches

1. **Configurer Sentry** (30min)
   - Error tracking production
   - Performance monitoring
   - Alerts automatiques

2. **Dashboard Analytics** (30min)
   - Core Web Vitals tracking
   - User engagement metrics
   - A11y issues tracking

**Impact Estimé**:

- DevOps: 9.0 → 10.0/10 (+1.0)
- Sécurité: 9.5 → 10.0/10 (+0.5)

---

### Phase 6: Documentation Finale (45min) 🟢

**Objectif**: Compléter documentation pour 10/10

#### Tâches

1. **README.md amélioré** (20min)
   - Architecture diagram
   - Quick start guide
   - Deployment guide

2. **CONTRIBUTING.md** (15min)
   - Code style guide
   - Pull request process
   - Testing requirements

3. **API Documentation** (10min)
   - Documenter API endpoints
   - Types et interfaces

**Impact Estimé**:

- Documentation: 9.5 → 10.0/10 (+0.5)

---

## 🗓️ Planning Recommandé

### Semaine 1 (4h)

- **Jour 1**: Phase 1 - Tests E2E Accessibilité (2-3h)
- **Jour 2**: Phase 2 - Optimisation Vendor Bundle (1.5h)

### Semaine 2 (4h)

- **Jour 3**: Phase 3 - Correction Tests TypeScript (1.5h)
- **Jour 4**: Phase 4 - Service Worker (1.5h)
- **Jour 5**: Phase 5 - Monitoring (1h)

### Finalisation

- **Jour 6**: Phase 6 - Documentation finale (45min)
- **Jour 7**: Tests complets + Sprint 2 Report

**Total**: 6-8 heures sur 1-2 semaines

---

## 📊 Score Projeté Après Sprint 2

| Catégorie         | Avant  | Après Sprint 2 | Amélioration |
| ----------------- | ------ | -------------- | ------------ |
| **Accessibilité** | 9.5/10 | **10.0/10** ✅ | +0.5         |
| **Sécurité**      | 9.5/10 | **10.0/10** ✅ | +0.5         |
| **Performance**   | 8.5/10 | **10.0/10** ✅ | +1.5         |
| **Documentation** | 9.5/10 | **10.0/10** ✅ | +0.5         |
| **Tests**         | 8.5/10 | **10.0/10** ✅ | +1.5         |
| **Code Quality**  | 8.5/10 | **10.0/10** ✅ | +1.5         |
| **DevOps**        | 8.0/10 | **10.0/10** ✅ | +2.0         |

**Score Final**: **10.0/10** 🏆

**Amélioration Totale** (depuis début): +3.0 points (7.0 → 10.0)

---

## ✅ Checklist Sprint 2

### Avant de Commencer

- [ ] Sprint 1 PR mergée dans main
- [ ] Branch Sprint 2 créée: `feature/sprint-2-excellence`
- [ ] Dependencies à jour

### Pendant Sprint 2

- [ ] Tests E2E accessibilité implémentés
- [ ] Vendor bundle < 350 KB
- [ ] 69/69 tests passing (100%)
- [ ] Service Worker activé
- [ ] Monitoring configuré
- [ ] Documentation complète

### Après Sprint 2

- [ ] Build production OK
- [ ] Tests E2E passent (CI)
- [ ] Lighthouse score: Performance 95+, A11y 100
- [ ] PR Sprint 2 créée
- [ ] Sprint 2 Report publié

---

## 🚀 Commencer Sprint 2

Pour commencer Sprint 2, exécuter:

```bash
# Créer branche Sprint 2
git checkout main
git pull galeon-community main
git checkout -b feature/sprint-2-excellence

# Installer dépendances supplémentaires
npm install --save-dev @axe-core/playwright @next/bundle-analyzer

# Lancer première phase
# (Tests E2E Accessibilité)
```

---

## 📚 Ressources

### Tests Accessibilité

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Testing Library](https://playwright.dev/docs/test-assertions)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

### Performance

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Web.dev Performance](https://web.dev/performance/)

### Service Workers

- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Note**: Ce roadmap est flexible. Prioriser selon les besoins business et ressources disponibles.
