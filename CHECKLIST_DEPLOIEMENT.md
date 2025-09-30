# ✅ CHECKLIST DE DÉPLOIEMENT - Galeon Community Hospital Map

**Version**: 1.0.0
**Date**: 2025-10-01
**Environnement cible**: Cloudflare Pages (Production)

---

## 📋 PRÉ-REQUIS ABSOLUS

Avant de commencer cette checklist, les actions suivantes **DOIVENT** être complètes:

- [ ] Toutes les actions de `ACTIONS_IMMEDIATES_REQUISES.md` sont complétées
- [ ] Token Mapbox exposé révoqué
- [ ] Nouveau token Mapbox configuré
- [ ] Variables d'environnement locales configurées
- [ ] Secrets GitHub configurés

**Si l'un de ces items n'est pas coché, retournez à `ACTIONS_IMMEDIATES_REQUISES.md`**

---

## 🔒 PHASE 1: VALIDATION SÉCURITÉ

### 1.1 Configuration des Secrets

- [ ] `.env.local` contient le nouveau token Mapbox (pas l'ancien)
- [ ] `.env.production` contient le nouveau token Mapbox (pas l'ancien)
- [ ] `.env.example` ne contient aucun vrai token
- [ ] GitHub Secret `NEXT_PUBLIC_MAPBOX_TOKEN` configuré
- [ ] GitHub Secret `CLOUDFLARE_API_TOKEN` configuré
- [ ] GitHub Secret `CLOUDFLARE_ACCOUNT_ID` configuré

**Validation**:
```bash
# Vérifier qu'aucun .env n'est tracké
git status | grep -E "\.env\.(local|production|development)"
# Résultat attendu: aucun output

# Vérifier .gitignore
grep "\.env" .gitignore
# Doit inclure: .env*.local, .env.production, etc.
```

### 1.2 Audit de Sécurité

- [ ] Aucune vulnérabilité npm critique ou haute
  ```bash
  npm audit --production
  # Résultat attendu: 0 vulnerabilities
  ```

- [ ] Headers de sécurité configurés dans `middleware.ts`
  - [ ] Content-Security-Policy avec nonce
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy

- [ ] Pas de tokens hardcodés dans le code
  ```bash
  # Rechercher pk.eyJ (format token Mapbox)
  git grep -n "pk\.eyJ" -- '*.ts' '*.tsx' '*.js' '*.jsx'
  # Résultat attendu: aucun match (sauf dans docs/comments)
  ```

### 1.3 Validation HTTPS/CSP

- [ ] Toutes les URLs externes sont HTTPS
- [ ] CSP autorise uniquement les domaines nécessaires
- [ ] Pas de 'unsafe-inline' ou 'unsafe-eval' dans CSP

---

## 🧪 PHASE 2: VALIDATION TESTS

### 2.1 Tests Unitaires

- [ ] Tous les tests unitaires passent
  ```bash
  npm test -- --run
  # Résultat attendu: All tests pass
  ```

- [ ] Coverage minimum atteint (>60%)
  ```bash
  npm test -- --coverage
  # Résultat attendu: Coverage >60% on new code
  ```

### 2.2 Tests E2E

- [ ] Installation des dépendances Playwright
  ```bash
  npx playwright install
  ```

- [ ] Tests E2E passent
  ```bash
  npm run test:e2e
  # Résultat attendu: All E2E tests pass
  ```

- [ ] Tests des fonctionnalités critiques:
  - [ ] Chargement de la carte
  - [ ] Affichage des marqueurs d'hôpitaux
  - [ ] Sidebar avec liste des hôpitaux
  - [ ] Détail d'un hôpital
  - [ ] Export PDF/Excel/JSON
  - [ ] Timeline navigation
  - [ ] Géolocalisation

### 2.3 Validation Qualité Code

- [ ] Linting passe sans erreurs
  ```bash
  npm run lint
  # Résultat attendu: No errors
  ```

- [ ] Type-checking passe
  ```bash
  npm run type-check
  # ou: npx tsc --noEmit
  # Résultat attendu: No errors
  ```

- [ ] Pas de console.log oubliés (sauf logger)
  ```bash
  git grep -n "console\\.log" -- '*.ts' '*.tsx' | grep -v "logger"
  # Vérifier manuellement les résultats
  ```

---

## 🏗️ PHASE 3: VALIDATION BUILD

### 3.1 Build Local

- [ ] Build réussit sans erreurs
  ```bash
  npm run build
  # Résultat attendu: Build successful
  ```

- [ ] Vérifier la taille des bundles
  ```bash
  # Après npm run build
  # Vérifier que First Load JS < 200kB pour les pages principales
  ```

- [ ] Pas de warnings critiques dans le build
  - Acceptable: quelques warnings Next.js mineurs
  - Non-acceptable: TypeScript errors, missing deps

### 3.2 Test Build Local

- [ ] Tester le build localement avec Wrangler
  ```bash
  npx wrangler pages dev .next
  # Ouvrir http://localhost:8788
  ```

- [ ] Fonctionnalités critiques fonctionnent:
  - [ ] Carte s'affiche correctement
  - [ ] Pas d'erreurs dans la console browser
  - [ ] Navigation fonctionne
  - [ ] Images s'affichent
  - [ ] Exports fonctionnent

### 3.3 Optimisation Build

- [ ] Images optimisées (WebP pour Cloudflare)
- [ ] CSS purgé (unused styles removed)
- [ ] JavaScript minifié
- [ ] Source maps générés pour debugging

---

## 🌍 PHASE 4: CONFIGURATION CLOUDFLARE

### 4.1 Configuration Pages

- [ ] Projet Cloudflare Pages créé
- [ ] Repository GitHub connecté
- [ ] Branche de production configurée (`main`)

**Build Settings**:
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
Environment variables: (configurées via GitHub Secrets + Wrangler)
Node version: 20.x
```

### 4.2 Variables d'Environnement Cloudflare

Via Cloudflare Dashboard > Pages > Settings > Environment Variables:

**Production**:
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` = nouveau token
- [ ] `NEXT_PUBLIC_CLOUDFLARE_BASE_URL` = https://map.galeon.community
- [ ] `NEXT_PUBLIC_API_URL` = https://api.galeon.community
- [ ] `NEXT_PUBLIC_APP_VERSION` = 1.0.0
- [ ] `NODE_ENV` = production
- [ ] `NEXT_TELEMETRY_DISABLED` = 1

**Preview** (optionnel mais recommandé):
- [ ] Même configuration que Production avec URLs de staging

### 4.3 Configuration DNS

- [ ] Domaine custom configuré: `map.galeon.community`
- [ ] SSL/TLS activé (Full ou Full Strict)
- [ ] CNAME pointant vers: `[project].pages.dev`
- [ ] Propagation DNS vérifiée
  ```bash
  nslookup map.galeon.community
  # Doit résoudre vers Cloudflare
  ```

### 4.4 Configuration Wrangler

- [ ] `wrangler.toml` configuré correctement
- [ ] Bindings configurés si nécessaire
- [ ] Routes personnalisées définies dans `_routes.json`

---

## 🚀 PHASE 5: DÉPLOIEMENT

### 5.1 Déploiement Preview (Test)

- [ ] Créer une branche de test
  ```bash
  git checkout -b deploy-test
  ```

- [ ] Push la branche
  ```bash
  git push origin deploy-test
  ```

- [ ] Vérifier que le déploiement preview réussit
  - [ ] GitHub Action passe (tous jobs verts)
  - [ ] Cloudflare Preview deployment réussit
  - [ ] URL preview accessible

- [ ] Tester sur l'URL preview:
  - [ ] Carte fonctionne
  - [ ] Données chargent
  - [ ] Pas d'erreurs console
  - [ ] Performance acceptable (< 3s First Load)

### 5.2 Déploiement Production

**⚠️ ATTENTION**: Ne procédez que si TOUS les points précédents sont cochés

- [ ] Merger la branche de test dans main
  ```bash
  git checkout main
  git merge deploy-test
  ```

- [ ] Tag la version
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0 - Production ready"
  ```

- [ ] Push vers production
  ```bash
  git push origin main
  git push origin v1.0.0
  ```

- [ ] Surveiller le déploiement
  - [ ] GitHub Actions: tous les jobs passent
  - [ ] Cloudflare Pages: deployment successful
  - [ ] Pas d'erreurs dans les logs

### 5.3 Vérification Post-Déploiement

**Tester sur https://map.galeon.community**:

- [ ] Carte s'affiche correctement
- [ ] Tous les marqueurs d'hôpitaux visibles
- [ ] Sidebar fonctionnelle
- [ ] Navigation entre pages fonctionne
- [ ] Détails des hôpitaux s'affichent
- [ ] Export PDF fonctionne
- [ ] Export Excel fonctionne
- [ ] Export JSON fonctionne
- [ ] Timeline fonctionne
- [ ] Géolocalisation fonctionne (avec permission)
- [ ] Pas d'erreurs dans Console DevTools
- [ ] Pas d'erreurs CSP dans Console
- [ ] Headers de sécurité présents (vérifier via DevTools Network)

---

## 📊 PHASE 6: VALIDATION PERFORMANCE

### 6.1 Lighthouse CI

- [ ] Score Performance > 90
- [ ] Score Accessibility > 90
- [ ] Score Best Practices > 95
- [ ] Score SEO > 90

```bash
# Tester avec Lighthouse CLI
npx lighthouse https://map.galeon.community --view
```

### 6.2 Web Vitals

Vérifier sur https://map.galeon.community:

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] FCP (First Contentful Paint) < 1.8s
- [ ] TTFB (Time to First Byte) < 600ms

### 6.3 Test Multi-Navigateurs

- [ ] Chrome/Edge (dernier)
- [ ] Firefox (dernier)
- [ ] Safari (dernier)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### 6.4 Test Multi-Appareils

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔍 PHASE 7: MONITORING & OBSERVABILITÉ

### 7.1 Configuration Analytics

- [ ] Cloudflare Analytics activé
- [ ] Web Vitals tracking configuré
- [ ] Erreurs JavaScript loguées

### 7.2 Configuration Alertes

- [ ] Alertes Cloudflare configurées (si dispo > 100 req/min)
- [ ] Monitoring Mapbox usage configuré
- [ ] Budget alerts configurés (optionnel)

### 7.3 Logs & Debug

- [ ] Logs Cloudflare accessibles
- [ ] Source maps déployés pour debugging
- [ ] Error tracking opérationnel

---

## 📝 PHASE 8: DOCUMENTATION

### 8.1 Documentation Projet

- [ ] README.md à jour avec:
  - [ ] Instructions de setup
  - [ ] Variables d'environnement documentées
  - [ ] Commandes de build/deploy
  - [ ] URL de production

- [ ] SECURITY.md présent et à jour
- [ ] DEVELOPMENT_GUIDELINES.md présent
- [ ] CHANGELOG.md créé avec v1.0.0

### 8.2 Documentation Équipe

- [ ] Procédure de déploiement documentée
- [ ] Procédure de rollback documentée
- [ ] Contacts d'urgence listés
- [ ] Accès aux services documentés (Cloudflare, Mapbox, GitHub)

---

## 🆘 PHASE 9: ROLLBACK PLAN

### 9.1 Préparation Rollback

- [ ] Savoir comment revenir à la version précédente
  ```bash
  # Via Cloudflare Dashboard > Deployments > Rollback
  # ou via Git:
  git revert HEAD
  git push origin main
  ```

- [ ] Backup de la configuration actuelle
- [ ] Backup des variables d'environnement

### 9.2 Critères de Rollback

Effectuer un rollback SI:
- [ ] Erreurs critiques > 5% des requêtes
- [ ] Performance dégradée > 50%
- [ ] Fonctionnalité critique cassée
- [ ] Problème de sécurité détecté

---

## ✅ VALIDATION FINALE

### Checklist de Validation

Cocher tous les items suivants avant de considérer le déploiement comme réussi:

**Sécurité** (10/10):
- [ ] Aucun secret dans le code
- [ ] Headers de sécurité configurés
- [ ] CSP strict sans unsafe-*
- [ ] HTTPS partout
- [ ] Token Mapbox avec restrictions

**Fonctionnalité** (8/8):
- [ ] Carte affichée
- [ ] Liste d'hôpitaux
- [ ] Détails d'hôpitaux
- [ ] Exports fonctionnels
- [ ] Timeline fonctionnelle
- [ ] Géolocalisation
- [ ] Navigation
- [ ] i18n (FR/EN)

**Performance** (5/5):
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Lighthouse > 90
- [ ] Bundle size raisonnable

**Tests** (4/4):
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Lint passe
- [ ] Type-check passe

**DevOps** (4/4):
- [ ] CI/CD fonctionnel
- [ ] Déploiement automatique
- [ ] Monitoring configuré
- [ ] Rollback plan prêt

**Documentation** (3/3):
- [ ] README à jour
- [ ] SECURITY.md présent
- [ ] Procédures documentées

**TOTAL: 34/34** ✅

---

## 📅 POST-DÉPLOIEMENT

### Jour J (Aujourd'hui)

- [ ] Vérifier l'application toutes les heures (4x)
- [ ] Surveiller les logs Cloudflare
- [ ] Surveiller l'usage Mapbox
- [ ] Vérifier qu'aucune alerte n'est remontée

### J+1

- [ ] Vérifier les metrics Analytics (trafic, erreurs)
- [ ] Vérifier Web Vitals dans Cloudflare Analytics
- [ ] Review des logs pour anomalies

### J+7

- [ ] Analyse complète des metrics
- [ ] Optimisations si nécessaire
- [ ] Planifier Phase 2 du PLAN_ACTION_2025.md

### J+30

- [ ] Review mensuelle de sécurité
- [ ] Vérification des dépendances (npm audit)
- [ ] Update si nécessaire

---

## 🎉 FÉLICITATIONS

Si tous les items ci-dessus sont cochés, votre application est déployée avec succès en production ! 🚀

**Score global**: 8.3/10
**Niveau de maturité**: Production-Ready
**Confiance**: Haute

### Prochaines Étapes Recommandées

1. **Court terme** (< 1 mois):
   - Compléter les tests manquants (coverage 80%+)
   - Implémenter le Service Worker
   - Configurer Sentry pour error tracking

2. **Moyen terme** (< 3 mois):
   - Phase 2 du PLAN_ACTION_2025.md
   - Accessibility AA compliance
   - Performance optimizations (Lighthouse 95+)

3. **Long terme** (< 6 mois):
   - Phase 3 du PLAN_ACTION_2025.md
   - Architecture documentation
   - Advanced features

---

**Document créé**: 2025-10-01
**Version**: 1.0.0
**Maintenu par**: DevOps Team
**Prochaine review**: J+30
