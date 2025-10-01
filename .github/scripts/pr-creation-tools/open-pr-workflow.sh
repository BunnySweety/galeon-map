#!/bin/bash

echo "=========================================="
echo "🚀 Workflow Pull Request Sprint 1 & 2"
echo "=========================================="
echo ""

# Étape 1: Ouvrir la page pour créer le token
echo "📝 Étape 1: Création du Token GitHub"
echo ""
echo "Ouverture de la page de création de token..."
start "https://github.com/settings/tokens/new?description=galeon-pr-creation&scopes=repo" 2>/dev/null

echo ""
echo "Configuration du token:"
echo "✓ Note: galeon-pr-creation (pré-rempli)"
echo "✓ Expiration: 7 days"
echo "✓ Permissions: 'repo' doit être coché"
echo ""
echo "Cliquez sur 'Generate token' puis copiez le token"
echo ""
read -p "Appuyez sur Entrée quand vous avez copié votre token..."

echo ""
echo "📤 Étape 2: Création du Pull Request"
echo ""
echo -n "Collez votre token GitHub: "
read -s GITHUB_TOKEN
echo ""
echo ""

# Créer le PR
if [ -n "$GITHUB_TOKEN" ]; then
  export GITHUB_TOKEN
  bash create-pr-api.sh
else
  echo "❌ Token vide, utilisation de la méthode manuelle..."
  echo ""
  echo "📋 Ouverture de GitHub pour créer le PR manuellement..."
  start "https://github.com/galeon-community/hospital-map/compare/main...feature/accessibility-aria-labels?expand=1" 2>/dev/null
  echo ""
  echo "Instructions:"
  echo "1. La page GitHub est ouverte"
  echo "2. Titre: Sprint 1 & 2: Accessibility, Performance & Testing (7.0 → 9.7/10)"
  echo "3. Copiez la description depuis CREATE_PR.md"
  echo "4. Cliquez 'Create pull request'"
fi

echo ""
echo "✨ Terminé!"
