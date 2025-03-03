#!/bin/bash

# Script de build personnalisé pour Cloudflare Pages

echo "Starting custom build process..."

# Installer les dépendances sans générer de fichiers de cache
echo "Installing dependencies..."
npm ci --no-fund --no-audit --no-progress --prefer-offline

# Construire l'application
echo "Building the application..."
npm run build

# Supprimer les fichiers de cache webpack
echo "Removing webpack cache files..."
rm -rf .next/cache/webpack
rm -rf cache/webpack

# Supprimer les fichiers inutiles pour réduire la taille du déploiement
echo "Cleaning up unnecessary files..."
find .next -name "*.map" -type f -delete
find node_modules -name "*.md" -type f -delete
find node_modules -name "*.d.ts" -type f -delete
find node_modules -name "*.map" -type f -delete
find node_modules -name "*.ts" -type f -not -name "*.d.ts" -delete
find node_modules -name "*.mjs.map" -type f -delete

echo "Build process completed successfully!" 