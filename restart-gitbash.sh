#!/bin/bash

# Script amélioré pour redémarrer proprement l'environnement de développement
echo "=== Redémarrage de l'environnement de développement ==="

# Arrêter tous les processus existants
echo "Arrêt des processus existants..."
taskkill //F //IM node.exe //T 2>/dev/null || true
sleep 2

# Nettoyer les caches et répertoires temporaires
echo "Nettoyage des caches et répertoires temporaires..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Recréer les répertoires
mkdir -p out
mkdir -p out/functions

# Validation du package.json
echo "Validation du package.json..."
npm ls --json 2>/dev/null || true

# Copier les fichiers de configuration
echo "Copie des fichiers de configuration..."
cp _worker.js out/ 2>/dev/null || echo "⚠️ _worker.js non trouvé."
cp _routes.json out/ 2>/dev/null || echo "⚠️ _routes.json non trouvé."
cp _headers out/ 2>/dev/null || echo "⚠️ _headers non trouvé."
cp _redirects out/ 2>/dev/null || echo "⚠️ _redirects non trouvé."

# Créer les fichiers Functions
cat > out/functions/_middleware.js << EOF
export async function onRequest(context) {
  return await context.next();
}
EOF

cat > out/functions/_routes.json << EOF
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
EOF

echo "Redémarrage de l'environnement en cours..."

# Utiliser le script de développement amélioré
if [ -f "dev-gitbash.sh" ]; then
  bash dev-gitbash.sh
else
  echo "Script de développement non trouvé. Démarrage manuel..."
  
  # Augmenter la mémoire disponible pour Node.js
  export NODE_OPTIONS="--max-old-space-size=4096"
  
  # Démarrer Next.js
  npx next dev
fi