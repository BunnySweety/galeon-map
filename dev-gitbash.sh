#!/bin/bash

# Script pour Git Bash sur Windows
echo "=== Démarrage de l'environnement de développement local ==="

# Arrêter les processus existants (version Windows)
echo "Arrêt des processus existants..."
taskkill //F //IM node.exe //T 2>/dev/null || true
sleep 1

# Nettoyage du dossier out
echo "Nettoyage du dossier out..."
rm -rf out

# Vérifier si le répertoire out existe
if [ ! -d "out" ]; then
  echo "Le répertoire 'out' n'existe pas. Création..."
  mkdir -p out
fi

# Toujours copier les fichiers de configuration à jour
echo "Copie des fichiers de configuration..."
cp _worker.js out/ 2>/dev/null || echo "Avertissement: _worker.js non trouvé"
cp _routes.json out/ 2>/dev/null || echo "Avertissement: _routes.json non trouvé"
cp _headers out/ 2>/dev/null || echo "Avertissement: _headers non trouvé"
cp _redirects out/ 2>/dev/null || echo "Avertissement: _redirects non trouvé"

# Créer le répertoire functions s'il n'existe pas
mkdir -p out/functions

# Créer un middleware minimal pour les functions
echo "export async function onRequest(context) {
  return await context.next();
}" > out/functions/_middleware.js

# Ajouter un fichier _routes.json simple pour les functions
echo '{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}' > out/functions/_routes.json

# Augmenter la mémoire disponible pour Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Fonction pour arrêter tous les processus à la sortie
cleanup() {
  echo "Arrêt des serveurs..."
  if [ ! -z "$NEXT_PID" ]; then
    kill $NEXT_PID 2>/dev/null || true
  fi
  if [ ! -z "$WRANGLER_PID" ]; then
    kill $WRANGLER_PID 2>/dev/null || true
  fi
  exit 0
}

# Capturer Ctrl+C pour arrêter proprement
trap cleanup INT TERM

# Lancer Next.js en arrière-plan (avec npx)
echo "Démarrage du serveur Next.js..."
npx next dev &
NEXT_PID=$!

# Attendre que Next.js démarre
echo "Attente du démarrage de Next.js (10 secondes)..."
for i in {1..10}; do
  echo -n "."
  sleep 1
done
echo ""

# Vérifier si Next.js a démarré correctement
if ! kill -0 $NEXT_PID 2>/dev/null; then
  echo "Erreur: Next.js n'a pas démarré. Abandon."
  cleanup
  exit 1
fi

# Lancer Wrangler pour le développement local
echo "Démarrage du serveur de développement Wrangler..."
npx wrangler pages dev out --port=8788 &
WRANGLER_PID=$!

# Attendre que Wrangler démarre
echo "Attente du démarrage de Wrangler (5 secondes)..."
sleep 5

# Vérifier si Wrangler a démarré correctement
if ! kill -0 $WRANGLER_PID 2>/dev/null; then
  echo "Attention: Wrangler pourrait ne pas avoir démarré correctement."
fi

# Ouvrir le navigateur (version Windows)
echo "Ouverture du navigateur..."
start http://localhost:3000

echo ""
echo "=== Environnement de développement démarré ==="
echo "Next.js: http://localhost:3000 (application principale)"
echo "Wrangler: http://localhost:8788 (émulation Cloudflare Pages)"
echo ""
echo "IMPORTANT: Pour éviter les boucles de redirection, utilisez directement:"
echo "- http://localhost:3000 pour accéder à l'application Next.js"
echo "- http://127.0.0.1:8788 pour tester le worker Cloudflare"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"

# Garder le script en vie
wait $NEXT_PID