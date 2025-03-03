#!/bin/bash

# Installer les dépendances avec npm install au lieu de npm ci
npm install

# Exécuter la commande de build
npm run build:cloudflare

# Vérifier si le build a réussi
if [ $? -eq 0 ]; then
  echo "✅ Build réussi !"
  exit 0
else
  echo "❌ Erreur lors du build !"
  exit 1
fi 