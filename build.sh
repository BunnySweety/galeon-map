#!/bin/bash

# Afficher la version de Node.js
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Supprimer le package-lock.json existant
echo "Removing package-lock.json..."
rm -f package-lock.json

# Installer les dépendances avec npm install
echo "Installing dependencies with npm install..."
npm install --no-package-lock

# Exécuter le build
echo "Building the application..."
npm run build

echo "Build completed successfully!" 