# 📋 Guide des Bonnes Pratiques de Développement

## 🎯 Objectif

Ce guide établit les bonnes pratiques pour maintenir la qualité et les performances du codebase Galeon Community Hospital Map.

## 🔧 Workflow de Développement

### Avant de Commencer

```bash
# 1. Mettre à jour les dépendances
npm install

# 2. Vérifier que l'application fonctionne
npm run dev
```

### Pendant le Développement

```bash
# Lancer l'application en mode développement
npm run dev

# Vérifier les erreurs TypeScript
npm run type-check

# Tester les fonctionnalités
npm run test
```

### Avant de Committer

```bash
# 1. Optimiser automatiquement le code
npm run optimize

# 2. Vérifier le build de production
npm run build

# 3. Tester l'export statique
npm run export
```

## 📝 Standards de Code

### 1. Logging

**✅ À faire :**

```typescript
import logger from '../utils/logger';

// En développement et production
logger.error('Erreur critique:', error);

// Seulement en développement
logger.debug('Information de debug:', data);
logger.warn('Avertissement:', warning);
```

**❌ À éviter :**

```typescript
// Ne jamais utiliser directement
console.log('Debug info');
console.error('Error');
```

### 2. Imports

**✅ À faire :**

```typescript
// Imports groupés et organisés
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Hospital } from '../api/hospitals/data';
import logger from '../utils/logger';
```

**❌ À éviter :**

```typescript
// Imports inutilisés
import { UnusedComponent } from './components';
```

### 3. Types TypeScript

**✅ À faire :**

```typescript
interface Props {
  hospital: Hospital;
  onSelect: (id: string) => void;
}

const Component: React.FC<Props> = ({ hospital, onSelect }) => {
  // Implementation
};
```

**❌ À éviter :**

```typescript
// Types any
const data: any = getData();
```

### 4. Gestion d'État

**✅ À faire :**

```typescript
// Utiliser Zustand pour l'état global
const { hospitals, setSelectedHospital } = useMapStore();

// useCallback pour les fonctions
const handleClick = useCallback(
  (id: string) => {
    setSelectedHospital(id);
  },
  [setSelectedHospital]
);
```

### 5. Performance

**✅ À faire :**

```typescript
// Mémoriser les calculs coûteux
const filteredHospitals = useMemo(() => {
  return hospitals.filter(h => h.status === 'deployed');
}, [hospitals]);

// Lazy loading des composants lourds
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## 🧪 Tests

### Tests Unitaires

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Tests E2E

```bash
# Tests Playwright
npm run test:e2e

# Tests en mode UI
npm run test:e2e:ui
```

## 🚀 Déploiement

### Environnements

**Développement :**

```bash
npm run deploy:cf-dev
```

**Production :**

```bash
npm run deploy:cf-prod
```

### Checklist Pré-Déploiement

- [ ] Code optimisé (`npm run optimize`)
- [ ] Build réussi (`npm run build`)
- [ ] Tests passés (`npm run test`)
- [ ] Pas d'erreurs TypeScript
- [ ] Fonctionnalités testées manuellement

## 📊 Monitoring

### Métriques à Surveiller

- Taille du bundle (visible dans `npm run build`)
- Temps de chargement des pages
- Erreurs en console (production)
- Performance Lighthouse

### Outils de Debug

```typescript
// En développement uniquement
if (process.env.NODE_ENV === 'development') {
  logger.debug('Debug info:', data);
}
```

## 🔄 Maintenance

### Hebdomadaire

- [ ] Exécuter `npm run optimize`
- [ ] Vérifier les warnings ESLint
- [ ] Mettre à jour les dépendances mineures

### Mensuelle

- [ ] Analyser la taille du bundle (`npm run optimize:analyze`)
- [ ] Réviser les performances
- [ ] Mettre à jour les dépendances majeures

### Trimestrielle

- [ ] Audit de sécurité (`npm audit`)
- [ ] Révision complète du code
- [ ] Optimisation des performances

## 🛠️ Outils Recommandés

### Extensions VSCode

- ESLint
- Prettier
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer

### Configuration Git Hooks

```bash
# Pre-commit hook
#!/bin/sh
npm run optimize
npm run type-check
```

## 🚨 Résolution de Problèmes

### Erreurs Communes

**Build qui échoue :**

```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

**Types TypeScript :**

```bash
# Vérifier les types
npm run type-check
```

**Performance :**

```bash
# Analyser le bundle
npm run optimize:analyze
```

### Debugging

**Logs en production :**

- Utiliser `logger.error()` pour les erreurs critiques
- Éviter `logger.debug()` en production

**Performance :**

- Utiliser React DevTools Profiler
- Analyser les re-renders avec `why-did-you-render`

## 📚 Ressources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)

### Bonnes Pratiques

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

## 🎯 Objectifs de Qualité

### Performance

- First Contentful Paint < 2s
- Largest Contentful Paint < 3s
- Cumulative Layout Shift < 0.1

### Code Quality

- 0 erreurs TypeScript
- < 10 warnings ESLint par fichier
- Coverage de tests > 80%

### Maintenabilité

- Fonctions < 50 lignes
- Composants < 200 lignes
- Fichiers < 500 lignes (sauf exceptions documentées)

---

**Dernière mise à jour :** $(date)  
**Version :** 1.0  
**Maintenu par :** Équipe Galeon
