#!/bin/bash

# Script de déploiement personnalisé pour Cloudflare Pages

# Construire l'application
echo "Building the application..."
npm run build

# Supprimer les fichiers de cache webpack
echo "Removing webpack cache files..."
rm -rf .next/cache/webpack
rm -rf cache/webpack

# Créer un répertoire de déploiement propre
echo "Creating clean deployment directory..."
mkdir -p deploy
cp -r .next deploy/
cp -r public deploy/
cp package.json deploy/
cp next.config.mjs deploy/

echo "Deployment preparation complete!" 