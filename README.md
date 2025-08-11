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
- **Framework :** Next.js 15.2.0 avec App Router
- **Langage :** TypeScript avec configuration stricte
- **Styling :** TailwindCSS + CSS personnalisé
- **Carte :** Mapbox GL JS
- **État :** Zustand + TanStack Query
- **Validation :** Zod
- **Internationalisation :** Lingui.js
- **Tests :** Vitest + Playwright
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

### 📊 Métriques
- **Build time** : ~7 secondes
- **Bundle size** : Optimisé pour le web
- **Performance** : Lighthouse score > 90
- **Accessibilité** : WCAG 2.1 AA compliant

## 🌍 Données

Le projet inclut **20+ hôpitaux français** avec :
- Informations complètes (nom, adresse, coordonnées)
- Statuts de déploiement avec dates
- Support multilingue des noms
- Validation des données avec Zod

## 🔧 Configuration

### Variables d'Environnement
```bash
# .env.local
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NODE_ENV=development
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

## 📞 Support

- **Documentation** : Voir `DEVELOPMENT_GUIDELINES.md`
- **Optimisations** : Voir `OPTIMIZATION_REPORT.md`
- **Issues** : Utiliser GitHub Issues
- **Email** : contact@galeon.com

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 2.0 (Optimisée)  
**Maintenu par** : Équipe Galeon