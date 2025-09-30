#!/bin/bash

# Script de diagnostic pour Galeon Community Hospital Map (adapté pour Git Bash)
echo "=== Démarrage du diagnostic ===\n"

# Informations système
echo "== Informations système =="
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo "OS: $(uname -a || ver)"
echo "Mémoire disponible: $(systeminfo 2>/dev/null | grep 'Physical Memory' || echo 'Information non disponible')"
echo "\n"

# Vérification des fichiers essentiels
echo "== Vérification des fichiers essentiels =="
ESSENTIAL_FILES=("next.config.mjs" "package.json" "tsconfig.json" "middleware.ts")
for file in "${ESSENTIAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file n'existe pas"
  fi
done
echo "\n"

# Vérification des fichiers de configuration Cloudflare
echo "== Vérification des fichiers de configuration Cloudflare =="
CF_FILES=("_worker.js" "_routes.json" "_headers" "_redirects")
for file in "${CF_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "⚠️ $file n'existe pas ou n'a pas été trouvé"
  fi
done
echo "\n"

# Vérification des dépendances
echo "== Vérification des dépendances =="
if [ -d "node_modules" ]; then
  echo "✅ node_modules existe"
  
  # Vérifier les dépendances critiques
  CRITICAL_DEPS=("next" "react" "mapbox-gl" "zustand" "@lingui/core" "@tanstack/react-query" "@unocss/webpack")
  for dep in "${CRITICAL_DEPS[@]}"; do
    if [ -d "node_modules/$dep" ]; then
      echo "✅ $dep est installé"
    else
      echo "❌ $dep n'est pas installé"
    fi
  done
else
  echo "❌ node_modules n'existe pas. Exécutez npm install"
fi
echo "\n"

# Test de construction
echo "== Test de construction minimale =="
echo "Tentative de construction minimale..."

# Sauvegarder la configuration actuelle
if [ -f "next.config.mjs" ]; then
  cp next.config.mjs next.config.mjs.bak
  
  # Créer une configuration minimale
  cat > next.config.mjs.min << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
}
export default nextConfig;
EOF
  
  # Utiliser la configuration minimale
  cp next.config.mjs.min next.config.mjs
  
  # Essayer de construire
  echo "Construction avec configuration minimale..."
  NODE_OPTIONS="--max-old-space-size=4096" npx next build --no-lint > build_log.txt 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Construction minimale réussie!"
  else
    echo "❌ Échec de la construction minimale. Voir build_log.txt pour les détails."
    echo "Extrait des erreurs:"
    grep -A 5 "Error" build_log.txt || grep -A 5 "error" build_log.txt || tail -n 10 build_log.txt
  fi
  
  # Restaurer la configuration
  mv next.config.mjs.bak next.config.mjs
  rm -f next.config.mjs.min
else
  echo "❌ next.config.mjs n'existe pas, impossible de tester la construction"
fi
echo "\n"

# Test de connexion à Cloudflare
echo "== Test de connexion à Cloudflare =="
echo "Vérification de la connexion à Cloudflare..."
npx wrangler whoami > wrangler_whoami.txt 2>&1

if grep -q "You are logged in" wrangler_whoami.txt; then
  echo "✅ Connecté à Cloudflare"
  ACCOUNT_NAME=$(grep "Account:" wrangler_whoami.txt | cut -d ':' -f 2 | xargs)
  echo "Compte: $ACCOUNT_NAME"
else
  echo "❌ Non connecté à Cloudflare. Veuillez exécuter 'npx wrangler login'"
fi
rm -f wrangler_whoami.txt
echo "\n"

# Vérification de l'environnement Windows
echo "== Vérification de l'environnement Windows =="
echo "Test des commandes Windows..."

if command -v taskkill >/dev/null 2>&1; then
  echo "✅ Commande taskkill disponible"
else
  echo "❌ Commande taskkill non disponible"
fi

if command -v start >/dev/null 2>&1; then
  echo "✅ Commande start disponible"
else
  echo "❌ Commande start non disponible"
fi
echo "\n"

# Conseils pour résoudre les problèmes
echo "== Conseils pour résoudre les problèmes =="
echo "1. Si vous rencontrez des erreurs de mémoire, augmentez la mémoire avec:"
echo "   export NODE_OPTIONS=\"--max-old-space-size=4096\""
echo ""
echo "2. Si la construction échoue avec des erreurs de dépendances:"
echo "   rm -rf node_modules"
echo "   npm cache clean --force"
echo "   npm install"
echo ""
echo "3. Si le serveur de développement se bloque:"
echo "   bash restart-gitbash.sh"
echo ""
echo "4. Pour un déploiement optimal sur Cloudflare Pages:"
echo "   bash deploy-gitbash.sh"
echo ""
echo "5. Pour tester la version Cloudflare en local:"
echo "   bash dev-gitbash.sh"
echo "\n"

echo "=== Diagnostic terminé ==="