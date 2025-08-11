// Script post-build pour préparer le déploiement sur Cloudflare
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

console.log('🚀 Exécution du script post-build...');

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`  ✓ Fichier copié: ${source} -> ${destination}`);
  } catch (error) {
    console.error(`  ❌ Erreur lors de la copie du fichier ${source}:`, error);
  }
}

// Fonction pour créer un dossier s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`  ✓ Dossier créé: ${directory}`);
  }
}

// Copier les fichiers nécessaires pour Cloudflare Pages
console.log('📋 Copie des fichiers pour Cloudflare Pages...');

// Copier _headers
if (fs.existsSync('_headers')) {
  copyFile('_headers', path.join('out', '_headers'));
}

// Copier _redirects
if (fs.existsSync('_redirects')) {
  copyFile('_redirects', path.join('out', '_redirects'));
}

// Copier _routes.json
if (fs.existsSync('_routes.json')) {
  copyFile('_routes.json', path.join('out', '_routes.json'));
}

// Créer le dossier functions s'il n'existe pas déjà
ensureDirectoryExists(path.join('out', 'functions'));

// Copier les fichiers du dossier functions
if (fs.existsSync('functions')) {
  const copyFunctionsDir = (source, destination) => {
    ensureDirectoryExists(destination);

    const items = fs.readdirSync(source, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const destPath = path.join(destination, item.name);

      if (item.isDirectory()) {
        copyFunctionsDir(sourcePath, destPath);
      } else {
        copyFile(sourcePath, destPath);
      }
    }
  };

  copyFunctionsDir('functions', path.join('out', 'functions'));
  console.log('  ✓ Dossier functions copié');
}

// Copier _worker.js
if (fs.existsSync('_worker.js')) {
  copyFile('_worker.js', path.join('out', '_worker.js'));
}

// Créer un fichier .nojekyll pour éviter le traitement Jekyll sur GitHub Pages
fs.writeFileSync(path.join('out', '.nojekyll'), '');
console.log('  ✓ Fichier .nojekyll créé');

// Créer un fichier 404.html qui redirige vers index.html
const notFoundContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/">
  <title>Redirection</title>
  <script>
    window.location.href = '/';
  </script>
</head>
<body>
  <p>Redirection vers la page d'accueil...</p>
  <a href="/">Cliquez ici si vous n'êtes pas redirigé automatiquement</a>
</body>
</html>
`;

fs.writeFileSync(path.join('out', '404.html'), notFoundContent);
console.log('  ✓ Fichier 404.html créé');

console.log('✅ Script post-build terminé avec succès');
