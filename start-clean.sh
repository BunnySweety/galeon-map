#!/bin/bash

echo "========================================"
echo "   Démarrage propre de l'application"
echo "========================================"

echo
echo "[1/4] Nettoyage des caches..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "  - Cache .next supprimé"
fi
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "  - Cache node_modules supprimé"
fi
if [ -d ".swc" ]; then
    rm -rf .swc
    echo "  - Cache .swc supprimé"
fi

echo
echo "[2/4] Arrêt des processus Node existants..."
pkill -f "next dev" 2>/dev/null && echo "  - Processus Node arrêtés" || echo "  - Aucun processus Node à arrêter"

echo
echo "[3/4] Vérification de la configuration..."
if [ -f "next.config.mjs" ]; then
    echo "  - Configuration Next.js trouvée (next.config.mjs)"
else
    echo "  - ATTENTION: Aucune configuration Next.js trouvée"
fi

echo
echo "[4/4] Démarrage du serveur de développement..."
echo "  - Ouverture automatique: http://localhost:3000"
echo "  - Appuyez sur Ctrl+C pour arrêter"
echo

npm run dev 