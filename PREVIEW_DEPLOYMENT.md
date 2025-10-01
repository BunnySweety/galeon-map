# Preview Deployment Guide

## 🔄 Preview Branch Setup

La branche `preview` est configurée pour les déploiements de test sur Cloudflare Pages.

### Branches disponibles

- **`main`** → Production deployment (`galeon-map.pages.dev`)
- **`preview`** → Preview/staging deployment (`preview-*.galeon-map.pages.dev`)

---

## 🚀 Déploiement Preview sur Cloudflare Pages

### Étape 1 : Configuration initiale (Une seule fois)

1. **Connectez-vous à Cloudflare Dashboard**
   - Allez sur https://dash.cloudflare.com
   - Sélectionnez **Workers & Pages**

2. **Si le projet existe déjà** (déployé depuis `main`)
   - Sélectionnez votre projet
   - Allez dans **Settings** > **Builds & deployments**
   - Sous **Preview deployments**, assurez-vous que c'est activé

3. **Si c'est un nouveau projet**
   - Suivez les étapes du [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Cloudflare créera automatiquement des preview deployments pour toutes les branches

---

### Étape 2 : Configuration des variables d'environnement

#### Variables pour Preview (Optionnel)

Dans **Settings** > **Environment variables**, ajoutez pour l'environnement **Preview** :

```bash
# Obligatoire
NODE_ENV=development
NEXT_PUBLIC_APP_VERSION=preview

# Recommandé
NEXT_PUBLIC_MAPBOX_TOKEN=your_preview_mapbox_token
```

**💡 Astuce** : Vous pouvez utiliser le même token Mapbox que production, ou créer un token séparé pour preview.

---

### Étape 3 : Déployer sur Preview

#### Option A : Push automatique

```bash
# Depuis votre machine locale
git checkout preview
git merge main  # Merge les derniers changements de main
git push
```

Cloudflare déploiera **automatiquement** sur une URL preview.

#### Option B : Tester une feature branch

```bash
# Créer une feature branch depuis preview
git checkout preview
git checkout -b feature/my-new-feature

# Faire vos modifications
git add .
git commit -m "feat: Add my new feature"
git push -u origin feature/my-new-feature
```

Cloudflare créera un déploiement preview unique pour cette branche :

- URL : `https://feature-my-new-feature.galeon-map.pages.dev`

---

## 🔍 URLs de déploiement

### Structure des URLs Cloudflare Pages

- **Production (main)** : `https://galeon-map.pages.dev`
- **Preview (preview)** : `https://preview.galeon-map.pages.dev` ou `https://[commit-hash].galeon-map.pages.dev`
- **Feature branches** : `https://[branch-name].[commit-hash].galeon-map.pages.dev`

---

## ✅ Workflow recommandé

### 1. Développement local

```bash
git checkout -b feature/new-feature
# Développement...
npm run dev
npm run test
npm run build
```

### 2. Preview deployment

```bash
git checkout preview
git merge feature/new-feature
git push
```

→ Cloudflare déploie automatiquement
→ Testez sur l'URL preview
→ Collectez les retours

### 3. Production deployment

```bash
git checkout main
git merge preview
git push
```

→ Cloudflare déploie en production
→ Application live pour les utilisateurs

---

## 📊 Surveillance des déploiements

### Dans Cloudflare Dashboard

1. Allez dans votre projet Pages
2. Onglet **Deployments**
3. Vous verrez :
   - **Production deployments** (branche `main`)
   - **Preview deployments** (autres branches)

### Statuts possibles

- 🟢 **Success** : Déploiement réussi
- 🔴 **Failed** : Échec (vérifiez les logs)
- 🟡 **Building** : En cours de build
- ⏸️ **Canceled** : Annulé

---

## 🐛 Dépannage

### Le déploiement preview échoue

```bash
# Vérifier localement
npm ci
npm run build
npm run test
```

### Preview URL ne fonctionne pas

- Attendez 2-3 minutes après le push
- Vérifiez dans Cloudflare que le build est terminé
- Consultez les logs de build

### Variables d'environnement manquantes

- Vérifiez dans **Settings** > **Environment variables**
- Assurez-vous que les variables sont définies pour **Preview**
- Redéployez après avoir ajouté des variables

---

## 🎯 Checklist avant merge en production

Depuis preview deployment :

- [ ] Tous les tests passent (101/101)
- [ ] Build réussit sans erreurs
- [ ] Carte Mapbox s'affiche
- [ ] Fonctionnalités testées manuellement
- [ ] Pas d'erreurs console (F12)
- [ ] Performance acceptable (Core Web Vitals)
- [ ] Testé sur mobile et desktop
- [ ] Langue FR/EN fonctionne

---

## 📚 Ressources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Preview Deployments](https://developers.cloudflare.com/pages/platform/preview-deployments/)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guide production
- [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md) - Guidelines développement

---

**Dernière mise à jour** : Octobre 2025
**Status** : ✅ Preview branch active et prête
