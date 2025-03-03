#!/bin/bash

# Afficher la version de Node.js
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Installer les dépendances avec npm install au lieu de npm ci
echo "Installing dependencies with npm install..."
npm install

# Exécuter le build
echo "Building the application..."
npm run build

echo "Build completed successfully!" 