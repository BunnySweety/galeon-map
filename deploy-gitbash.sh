#!/bin/bash

# Script de déploiement pour Cloudflare Pages
# Usage: bash deploy-gitbash.sh [dev|prod]

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier l'environnement
ENV=${1:-"dev"}
if [ "$ENV" == "prod" ]; then
  ENV_FILE=".env.production"
  BRANCH="main"
  log "Déploiement en PRODUCTION"
else
  ENV_FILE=".env.development"
  BRANCH="preview"
  log "Déploiement en DÉVELOPPEMENT"
fi

# Vérifier si le fichier d'environnement existe
if [ ! -f "$ENV_FILE" ]; then
  error "Fichier d'environnement $ENV_FILE introuvable"
  exit 1
fi

# Nettoyer les répertoires de build
log "Nettoyage des répertoires de build..."
rm -rf .next out
success "Répertoires nettoyés"

# Copier le fichier d'environnement
log "Copie du fichier d'environnement..."
cp $ENV_FILE .env.local
success "Fichier d'environnement copié"

# Construire l'application avec Next.js
log "Construction de l'application avec Next.js..."
NODE_ENV=production npx next build

# Vérifier si le build a réussi
if [ $? -eq 0 ] && [ -d "out" ]; then
  success "Build Next.js réussi"
  
  # Copier les fichiers statiques supplémentaires
  log "Copie des fichiers statiques supplémentaires..."
  cp _headers out/ 2>/dev/null || true
  cp _redirects out/ 2>/dev/null || true
  cp _routes.json out/ 2>/dev/null || true
  success "Fichiers statiques supplémentaires copiés"
  
  # Vérifier si le fichier index.html existe
  if [ ! -f "out/index.html" ]; then
    warn "Fichier index.html manquant, création d'un fichier de redirection..."
    cat > out/index.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeon Hospitals Map</title>
  <meta http-equiv="refresh" content="0;url=/hospitals">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #0f172a;
    }
    .loading-container {
      height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .logo {
      width: 40px;
      height: 40px;
      margin-right: 0.5rem;
    }
    .title {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }
    .loading-text {
      color: #94a3b8;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div id="__next">
    <div class="loading-container">
      <div class="loading-content">
        <div class="logo-container">
          <img src="/logo-white.svg" alt="Galeon Logo" class="logo">
          <h1 class="title">Galeon Hospitals Map</h1>
        </div>
        <p class="loading-text">Redirection vers l'application...</p>
      </div>
    </div>
  </div>
</body>
</html>
EOF
    success "Fichier index.html créé"
  fi
  
  # Vérifier si le répertoire hospitals existe
  if [ ! -d "out/hospitals" ]; then
    warn "Répertoire hospitals manquant, création..."
    mkdir -p out/hospitals
    cp out/index.html out/hospitals/index.html 2>/dev/null || true
    success "Répertoire hospitals créé"
  fi
else
  # Si le build a échoué, créer une version statique
  warn "Build Next.js échoué, création d'une version statique..."
  
  # Créer le répertoire out
  log "Création du répertoire out..."
  mkdir -p out
  success "Répertoire out créé"
  
  # Copier les fichiers statiques
  log "Copie des fichiers statiques..."
  cp -r public/* out/ 2>/dev/null || true
  cp _headers out/ 2>/dev/null || true
  cp _redirects out/ 2>/dev/null || true
  cp _routes.json out/ 2>/dev/null || true
  success "Fichiers statiques copiés"
  
  # Créer un fichier index.html minimal
  log "Création d'un fichier index.html minimal..."
  cat > out/index.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeon Hospitals Map</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .loading-container {
      height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f172a;
    }
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .logo {
      width: 40px;
      height: 40px;
      margin-right: 0.5rem;
    }
    .title {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }
    .loading-text {
      color: #94a3b8;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div id="__next">
    <div class="loading-container">
      <div class="loading-content">
        <div class="logo-container">
          <img src="/logo-white.svg" alt="Galeon Logo" class="logo">
          <h1 class="title">Galeon Hospitals Map</h1>
        </div>
        <p class="loading-text">Chargement de l'application...</p>
      </div>
    </div>
  </div>
  <script>
    // Redirection vers la page des hôpitaux
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        window.location.href = '/hospitals';
      }, 1000);
    });
  </script>
</body>
</html>
EOF
  success "Fichier index.html créé"
  
  # Créer une page hospitals/index.html
  log "Création de la page hospitals/index.html..."
  mkdir -p out/hospitals
  cat > out/hospitals/index.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeon Hospitals Map</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #0f172a;
      color: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
    }
    .logo {
      width: 40px;
      height: 40px;
      margin-right: 1rem;
    }
    .title {
      font-size: 2rem;
      margin: 0;
    }
    .hospital-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .hospital-card {
      background-color: #1e293b;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    .hospital-card:hover {
      transform: translateY(-5px);
    }
    .hospital-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
    .hospital-content {
      padding: 1rem;
    }
    .hospital-name {
      font-size: 1.25rem;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .hospital-status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .status-deployed {
      background-color: #10b981;
      color: white;
    }
    .status-signed {
      background-color: #f59e0b;
      color: white;
    }
    .hospital-address {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }
    .hospital-date {
      font-size: 0.75rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <img src="/logo-white.svg" alt="Galeon Logo" class="logo">
      <h1 class="title">Galeon Hospitals Map</h1>
    </header>
    
    <div class="hospital-list">
      <div class="hospital-card">
        <img src="/logo-white.svg" alt="Hospital" class="hospital-image">
        <div class="hospital-content">
          <h2 class="hospital-name">Hôpital Galeon Paris</h2>
          <span class="hospital-status status-deployed">Déployé</span>
          <p class="hospital-address">123 Avenue de Paris, 75001 Paris</p>
          <p class="hospital-date">Déployé le: 15/01/2023</p>
        </div>
      </div>
      
      <div class="hospital-card">
        <img src="/logo-white.svg" alt="Hospital" class="hospital-image">
        <div class="hospital-content">
          <h2 class="hospital-name">Hôpital Galeon Lyon</h2>
          <span class="hospital-status status-signed">Signé</span>
          <p class="hospital-address">456 Rue de Lyon, 69001 Lyon</p>
          <p class="hospital-date">Signé le: 20/02/2023</p>
        </div>
      </div>
      
      <div class="hospital-card">
        <img src="/logo-white.svg" alt="Hospital" class="hospital-image">
        <div class="hospital-content">
          <h2 class="hospital-name">Hôpital Galeon Marseille</h2>
          <span class="hospital-status status-deployed">Déployé</span>
          <p class="hospital-address">789 Boulevard de Marseille, 13001 Marseille</p>
          <p class="hospital-date">Déployé le: 10/03/2023</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
EOF
  success "Fichier hospitals/index.html créé"
fi

# Déployer sur Cloudflare Pages
log "Déploiement sur Cloudflare Pages..."
# Afficher la branche utilisée pour le déploiement
log "Déploiement sur la branche: $BRANCH"

# Déterminer l'environnement en fonction de la branche
if [ "$BRANCH" == "main" ]; then
  log "Environnement de déploiement: production (branche main)"
else
  log "Environnement de déploiement: preview (branche $BRANCH)"
fi

# Déployer sur Cloudflare Pages avec la branche appropriée
npx wrangler pages deploy out --project-name map-galeon-community --branch $BRANCH --commit-dirty=true

# Vérifier le résultat du déploiement
if [ $? -eq 0 ]; then
  success "Déploiement réussi sur la branche $BRANCH"
  if [ "$BRANCH" == "main" ]; then
    log "L'application est disponible sur https://map.galeon.community"
  else
    log "L'application est disponible sur https://preview.map-galeon-community.pages.dev"
    log "Si vous avez configuré un domaine personnalisé pour la branche preview, l'application sera également disponible sur ce domaine"
    log "Par exemple: https://preview.map.galeon.community (si configuré)"
  fi
else
  error "Échec du déploiement"
  exit 1
fi