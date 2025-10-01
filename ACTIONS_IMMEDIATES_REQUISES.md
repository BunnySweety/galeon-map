# 🚨 ACTIONS IMMÉDIATES REQUISES - SÉCURITÉ CRITIQUE

**Date**: 2025-10-01
**Priorité**: CRITIQUE - À EFFECTUER IMMÉDIATEMENT
**Temps estimé**: 15-30 minutes

---

## ⚠️ ALERTE DE SÉCURITÉ

Un token Mapbox exposé a été détecté et supprimé du code source. Des actions immédiates sont requises avant tout déploiement en production.

**Token compromis**: `pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ`

---

## 📋 CHECKLIST DES ACTIONS OBLIGATOIRES

### ✅ Action 1: Révoquer le Token Mapbox Exposé (URGENT)

**Délai**: À faire MAINTENANT (< 5 minutes)

1. Se connecter à [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Localiser le token: `pk.eyJ1IjoiamVhbmJvbjkxIi...`
3. Cliquer sur "Delete" ou "Revoke"
4. Confirmer la révocation

**Pourquoi c'est urgent**: Ce token est public et peut être utilisé par n'importe qui, générant des coûts sur votre compte Mapbox.

---

### ✅ Action 2: Créer un Nouveau Token Mapbox Sécurisé

**Délai**: Immédiatement après l'Action 1 (5-10 minutes)

#### 2.1 Créer le token

1. Aller sur [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/)
2. Cliquer "Create a token"
3. Nom suggéré: `Galeon Community Map - Production`

#### 2.2 Configurer les restrictions (OBLIGATOIRE)

**URL Restrictions** (critical):

```
# Pour la production:
https://map.galeon.community/*
https://*.galeon.community/*

# Pour le développement (token séparé recommandé):
http://localhost:3000/*
http://127.0.0.1:3000/*
https://map-dev.galeon.community/*
```

**Scopes** (principe du moindre privilège):

- ✅ `styles:read` - Lecture des styles de carte
- ✅ `fonts:read` - Lecture des polices
- ✅ `tiles:read` - Lecture des tuiles de carte
- ❌ Tous les autres scopes: **DÉSACTIVÉS**

#### 2.3 Copier le token généré

**ATTENTION**: Le token ne sera affiché qu'une seule fois. Copiez-le immédiatement.

---

### ✅ Action 3: Configurer les Variables d'Environnement

**Délai**: Immédiatement après l'Action 2 (5 minutes)

#### 3.1 Configuration locale (.env.local)

```bash
# Ouvrir le fichier
# Le fichier a déjà été préparé avec des commentaires

# Remplacer la ligne:
NEXT_PUBLIC_MAPBOX_TOKEN=your_new_mapbox_token_here

# Par:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...VOTRE_NOUVEAU_TOKEN
```

#### 3.2 Configuration production (.env.production)

```bash
# Ouvrir le fichier
# Le fichier a déjà été préparé avec des commentaires

# Remplacer la ligne:
NEXT_PUBLIC_MAPBOX_TOKEN=your_new_mapbox_token_here

# Par:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...VOTRE_NOUVEAU_TOKEN_PRODUCTION
```

**Recommandation**: Utilisez des tokens différents pour dev et prod pour une meilleure traçabilité.

---

### ✅ Action 4: Configurer les Secrets GitHub (pour CI/CD)

**Délai**: Avant le premier push (10 minutes)

#### 4.1 Accéder aux secrets

1. Aller sur votre repository GitHub
2. Cliquer sur "Settings" > "Secrets and variables" > "Actions"
3. Cliquer sur "New repository secret"

#### 4.2 Ajouter les secrets requis

| Nom du Secret              | Valeur                     | Obligatoire   | Description                     |
| -------------------------- | -------------------------- | ------------- | ------------------------------- |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Votre nouveau token Mapbox | ✅ OUI        | Token pour build et déploiement |
| `CLOUDFLARE_API_TOKEN`     | Token Cloudflare Pages     | ✅ OUI        | Pour déploiements automatiques  |
| `CLOUDFLARE_ACCOUNT_ID`    | ID compte Cloudflare       | ✅ OUI        | Identifiant du compte           |
| `CODECOV_TOKEN`            | Token Codecov              | ⚠️ Recommandé | Coverage reporting              |
| `SNYK_TOKEN`               | Token Snyk                 | ⚠️ Recommandé | Security scanning               |

#### 4.3 Obtenir les tokens Cloudflare

**API Token**:

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. "Create Token" > "Edit Cloudflare Workers" template
3. Permissions requises:
   - Account > Cloudflare Pages > Edit
   - Zone > Zone > Read

**Account ID**:

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionner votre site
3. Copier l'Account ID depuis la sidebar

---

### ✅ Action 5: Vérifier la Configuration

**Délai**: Après les actions 1-4 (5 minutes)

#### 5.1 Test local

```bash
# Vérifier que le token est bien configuré
npm run dev

# Ouvrir http://localhost:3000
# Vérifier que la carte s'affiche correctement
# Console ne doit pas afficher d'erreur Mapbox
```

#### 5.2 Vérifier .gitignore

```bash
# Vérifier que les fichiers .env ne sont PAS trackés
git status

# NE DEVRAIT PAS VOIR:
# .env.local
# .env.production
# .env.development
```

#### 5.3 Vérifier les commits précédents

```bash
# Vérifier si le token a été commité par le passé
git log --all --full-history --source -- .env.local .env.production

# Si des commits apparaissent, considérer un git filter-branch
# ou contacter le support pour assistance
```

---

## 🔒 BONNES PRATIQUES DE SÉCURITÉ

### Gestion des Tokens

1. **JAMAIS** commiter de tokens dans Git
2. Utiliser des tokens différents pour dev/staging/prod
3. Rotation régulière des tokens (tous les 6 mois)
4. Révoquer immédiatement tout token exposé
5. Utiliser toujours des restrictions d'URL
6. Appliquer le principe du moindre privilège (scopes minimaux)

### Surveillance

1. Activer les alertes Mapbox pour usage anormal
2. Monitorer les logs d'accès mensuellement
3. Configurer des limites de coûts sur Mapbox

### En cas d'exposition future

```bash
# Script de révocation d'urgence
# 1. Révoquer le token sur Mapbox
# 2. Générer nouveau token
# 3. Mettre à jour les secrets GitHub
# 4. Redéployer immédiatement
# 5. Analyser les logs pour détecter abus
```

---

## 📊 VALIDATION DE LA SÉCURITÉ

Avant de considérer ces actions comme complètes, vérifiez:

- [ ] Ancien token Mapbox révoqué sur account.mapbox.com
- [ ] Nouveau token créé avec restrictions URL
- [ ] Nouveau token configuré avec scopes minimaux
- [ ] .env.local mis à jour avec le nouveau token
- [ ] .env.production mis à jour avec le nouveau token
- [ ] Secrets GitHub configurés (minimum: MAPBOX + CLOUDFLARE)
- [ ] Test local réussi (carte s'affiche)
- [ ] Aucun fichier .env dans `git status`
- [ ] Documentation lue et comprise

---

## 🚀 PROCHAINES ÉTAPES (Après validation)

Une fois toutes les actions ci-dessus complétées:

1. **Test du build production**:

   ```bash
   npm run build
   npx wrangler pages dev .next
   ```

2. **Premier déploiement**:

   ```bash
   git add .
   git commit -m "Security: Remove exposed Mapbox token, update configuration"
   git push origin main
   ```

3. **Surveillance du CI/CD**:
   - Vérifier que la GitHub Action s'exécute correctement
   - Valider le déploiement sur Cloudflare Pages
   - Tester l'application en production

4. **Phase suivante**: Continuer avec le PLAN_ACTION_2025.md (Phase 2)

---

## 📞 SUPPORT

### En cas de problème

**Erreur "Mapbox token is required"**:

- Vérifier que `NEXT_PUBLIC_MAPBOX_TOKEN` est bien défini dans .env.local
- Redémarrer le serveur dev après modification des .env

**Token ne fonctionne pas**:

- Vérifier les restrictions d'URL (doit inclure localhost:3000)
- Vérifier les scopes (minimum: styles:read, fonts:read, tiles:read)
- Attendre 1-2 minutes après création du token

**CI/CD échoue**:

- Vérifier que les secrets GitHub sont bien configurés
- Vérifier les logs de la GitHub Action
- Vérifier les permissions du token Cloudflare

### Ressources

- [Mapbox Token Management](https://docs.mapbox.com/accounts/overview/tokens/)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

## ✅ CONFIRMATION

Une fois toutes les actions complétées, vous pouvez marquer ce document comme traité:

```bash
# Renommer le fichier pour archivage
mv ACTIONS_IMMEDIATES_REQUISES.md ACTIONS_IMMEDIATES_COMPLETEES_$(date +%Y%m%d).md
```

**Date de complétion**: **\*\*\*\***\_\_\_**\*\*\*\***
**Validé par**: **\*\*\*\***\_\_\_**\*\*\*\***

---

**Document créé**: 2025-10-01
**Version**: 1.0
**Auteur**: Audit de sécurité automatique
**Classification**: CONFIDENTIEL - NE PAS PARTAGER
