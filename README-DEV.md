# Guide de développement

Ce document explique comment lancer le projet en mode développement et résoudre les problèmes courants.

## Scripts disponibles

### Développement standard

```bash
npm run dev
```

Lance le serveur de développement Next.js standard. Peut rester bloqué sur "Compiling / ..." dans certains cas.

### Développement avec contournement des problèmes

```bash
npm run dev:fix
```

Lance un serveur de développement statique qui contourne les problèmes de compilation. Ce script :

1. Nettoie les caches
2. Compile les traductions
3. Corrige les problèmes avec `@messageformat/parser` si nécessaire
4. Crée une configuration Next.js simplifiée pour l'export statique
5. Construit le site en mode statique
6. Lance un serveur HTTP simple pour servir les fichiers statiques

**Note** : Ce mode ne prend pas en charge le hot-reload. Vous devez redémarrer le serveur après chaque modification.

### Nettoyage des caches

```bash
npm run clean
```

Supprime les dossiers `.next`, `out` et les caches de Node.js.

## Problèmes connus

### Blocage sur "Compiling / ..."

Ce problème est causé par des modules qui utilisent des imports dynamiques (`unconfig` et `jiti`). Pour le résoudre, utilisez `npm run dev:fix`.

### Erreurs avec @messageformat/parser

Le script `dev:fix` corrige automatiquement ce problème en ajoutant une valeur par défaut pour `Pattern_Syntax`.

## Déploiement

Pour déployer sur Cloudflare Pages :

```bash
npm run deploy:cf
```

Cela construit le site en mode statique et le déploie sur Cloudflare Pages.
