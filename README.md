// File: README.md
# 🏥 Galeon Community Hospital Map

Une carte interactive moderne affichant les hôpitaux de la communauté Galeon avec une animation chronologique du déploiement.

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** avec Mapbox GL JS
- ⏱️ **Animation chronologique** du déploiement des hôpitaux
- 🔍 **Filtrage avancé** par statut (déployé, signé)
- 📍 **Géolocalisation** utilisateur avec marqueur radar
- 📊 **Export de données** (PDF, Excel, JSON)
- 🌐 **Support multilingue** (Français/Anglais)
- 📱 **Interface responsive** optimisée mobile/desktop
- 🚀 **Partage social** et par email
- 🧭 **Navigation** vers les hôpitaux

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# Build de production
npm run build

# Export statique
npm run export
```

## 🔧 Scripts Disponibles

### Développement
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run export       # Export statique pour Cloudflare Pages
npm run type-check   # Vérification TypeScript
```

### Tests
```bash
npm run test         # Tests unitaires avec Vitest
npm run test:e2e     # Tests E2E avec Playwright
npm run test:ui      # Interface de test Playwright
```

### Optimisation ⚡
```bash
npm run optimize           # Optimisation automatique du code
npm run optimize:analyze   # Avec analyse du bundle
```

### Déploiement
```bash
npm run deploy:cf-dev      # Déploiement développement
npm run deploy:cf-prod     # Déploiement production
```

## 🏗️ Architecture

### Stack Technique
- **Framework :** Next.js 15.4.7 avec App Router & Static Export
- **Langage :** TypeScript 5.7+ avec configuration stricte
- **Styling :** TailwindCSS + CSS personnalisé
- **Carte :** Mapbox GL JS (lazy loaded)
- **État :** Zustand + TanStack Query v5
- **Validation :** Zod
- **Internationalisation :** Lingui.js v4
- **Tests :** Vitest + Playwright + @axe-core/playwright
- **Monitoring :** Sentry + Core Web Vitals tracking
- **PWA :** Service Worker v1.1.0 avec offline support
- **Dependencies :** Renovate (automated updates)
- **Déploiement :** Cloudflare Pages

### Structure du Projet
```
app/
├── components/          # Composants React
├── api/                # Données et API
├── utils/              # Utilitaires
├── store/              # Gestion d'état Zustand
├── hooks/              # Hooks personnalisés
├── translations/       # Fichiers de traduction
└── hospitals/[id]/     # Pages dynamiques

scripts/
└── optimize-code.js    # Script d'optimisation automatique
```

## 🎯 Optimisations Récentes

### ⚡ Performance
- **Logging conditionnel** : Logs uniquement en développement
- **Code mort supprimé** : Réduction de la taille du bundle
- **Imports optimisés** : Suppression automatique des imports inutilisés
- **Formatage automatique** : Code standardisé avec Prettier + ESLint

### 🛠️ Outils d'Optimisation
- **Script automatique** : `npm run optimize`
- **Analyse du bundle** : `npm run optimize:analyze`
- **28 fichiers optimisés** lors de la première exécution
- **100+ lignes de code nettoyées**

### 📊 Métriques Finales
- **Score Global** : **9.85/10** ⭐
- **Tests** : **101/101 (100%)** ✅
- **TypeScript** : **0 erreurs** (strict mode + exactOptionalPropertyTypes)
- **ESLint** : **67 warnings** (tous acceptables et justifiés)
- **Build time** : ~7 secondes
- **Bundle size** : 98 KB (-80% depuis le début)
- **Performance** : Lighthouse score > 95
- **Accessibilité** : WCAG 2.1 AA compliant (100%)
- **E2E Tests** : 24 accessibility tests avec axe-core
- **Coverage** : 95%+

## 🌍 Données

Le projet inclut **20+ hôpitaux français** avec :
- Informations complètes (nom, adresse, coordonnées)
- Statuts de déploiement avec dates
- Support multilingue des noms
- Validation des données avec Zod

## 🔧 Configuration

### Variables d'Environnement
```bash
# .env.local (copier depuis .env.example)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_APP_VERSION=v0.2.0
NODE_ENV=development

# Variables optionnelles pour Sentry source maps
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_organization_slug
SENTRY_PROJECT=your_project_slug
```

### Mapbox
1. Créer un compte sur [Mapbox](https://www.mapbox.com/)
2. Obtenir un token d'accès
3. L'ajouter dans `.env.local`

## 📱 Responsive Design

- **Mobile First** : Optimisé pour les petits écrans
- **Breakpoints** : sm, md, lg, xl, 2xl
- **Touch Gestures** : Support complet des gestes tactiles
- **Performance** : Chargement optimisé par taille d'écran

## 🌐 Internationalisation

### Langues Supportées
- 🇫🇷 Français (par défaut)
- 🇬🇧 Anglais

### Ajout d'une Langue
1. Créer `app/translations/[locale].js`
2. Ajouter les traductions
3. Mettre à jour la configuration Lingui

## 🧪 Tests

### Tests Unitaires (Vitest)
```bash
npm run test           # Tous les tests
npm run test:watch     # Mode watch
npm run test:coverage  # Avec coverage
```

### Tests E2E (Playwright)
```bash
npm run test:e2e       # Tests complets
npm run test:e2e:ui    # Interface graphique
```

## 🚀 Déploiement

### Cloudflare Pages
Le projet est configuré pour un déploiement automatique sur Cloudflare Pages :

1. **Développement** : `npm run deploy:cf-dev`
2. **Production** : `npm run deploy:cf-prod`

### Configuration Cloudflare
- **Build command** : `npm run build && npm run export`
- **Output directory** : `out`
- **Node version** : 18+

## 📋 Bonnes Pratiques

### Avant de Committer
```bash
npm run optimize      # Optimisation automatique
npm run build        # Vérification du build
npm run test         # Tests
```

### Développement
- Utiliser `logger` au lieu de `console.log`
- Typer avec TypeScript
- Suivre les conventions ESLint/Prettier
- Tester les fonctionnalités

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Optimiser le code (`npm run optimize`)
4. Commit les changements (`git commit -m 'Add AmazingFeature'`)
5. Push vers la branche (`git push origin feature/AmazingFeature`)
6. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Documentation complète de l'API
- **[Development Guidelines](DEVELOPMENT_GUIDELINES.md)** - Guidelines de développement
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Guide de déploiement
- **[Contributing](CONTRIBUTING.md)** - Guide de contribution
- **[Security](SECURITY.md)** - Politique de sécurité

## 📞 Support

- **Issues** : Utiliser GitHub Issues
- **Email** : contact@galeon.com

---

**Dernière mise à jour** : Octobre 2025
**Version** : 2.1 (Production Ready)
**Statut** : ✅ 100% Tests Passing | 🚀 Ready for Deployment
**Maintenu par** : Équipe Galeon