import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Chemin vers le répertoire de sortie
const outDir = path.join(rootDir, 'out');
const publicDir = path.join(rootDir, 'public');

// Copier les fichiers de configuration de Cloudflare Pages
const cloudflareConfigFiles = ['_routes.json', '_redirects', '_headers'];

for (const file of cloudflareConfigFiles) {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(outDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ ${file} a été copié avec succès dans le répertoire de sortie.`);
  } else {
    console.log(`⚠️ ${file} n'existe pas dans le répertoire public.`);
  }
}

// Créer un fichier 404.html dans le répertoire de sortie
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page not found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f7f7f7;
      color: #333;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 2rem;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404 - Page not found</h1>
    <p>The page you are looking for does not exist or has been moved.</p>
    <a href="/">Go back to home page</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, '404.html'), notFoundHtml, 'utf8');
console.log('✅ 404.html a été créé avec succès dans le répertoire de sortie.');

// Créer le répertoire functions s'il n'existe pas
const functionsDir = path.join(rootDir, 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Contenu du fichier _middleware.js
const middlewareContent = `export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Gérer les fichiers statiques
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json'
  ) {
    return context.next();
  }

  // Gérer les routes API
  if (pathname.startsWith('/api/')) {
    // Pour les routes API dynamiques comme /api/hospitals/1
    const hospitalIdMatch = pathname.match(/^\\/api\\/hospitals\\/([^\\/]+)$/);
    if (hospitalIdMatch) {
      const id = hospitalIdMatch[1];
      // Rediriger vers le fichier HTML statique
      const newUrl = new URL(\`/api/hospitals/\${id}/index.html\`, url.origin);
      return context.next();
    }
    
    // Pour la route API principale /api/hospitals
    if (pathname === '/api/hospitals') {
      return context.next();
    }
  }

  // Gérer les routes dynamiques comme /hospitals/1
  const hospitalPageMatch = pathname.match(/^\\/hospitals\\/([^\\/]+)$/);
  if (hospitalPageMatch) {
    const id = hospitalPageMatch[1];
    // Rediriger vers le fichier HTML statique
    const newUrl = new URL(\`/hospitals/\${id}/index.html\`, url.origin);
    return context.next();
  }

  // Gérer la page d'accueil
  if (pathname === '/' || pathname === '') {
    return context.next();
  }

  // Rediriger vers la page d'accueil pour les routes non reconnues
  return Response.redirect(new URL('/', request.url), 302);
}`;

// Créer le fichier _middleware.js dans le répertoire functions
fs.writeFileSync(
  path.join(functionsDir, '_middleware.js'),
  middlewareContent,
  'utf8'
);

console.log('✅ _middleware.js a été créé avec succès dans le répertoire functions.');

// Contenu du fichier _routes.json pour functions
const functionsRoutesConfig = {
  "version": 1,
  "include": ["/*"],
  "exclude": []
};

// Créer le fichier _routes.json dans le répertoire functions
fs.writeFileSync(
  path.join(functionsDir, '_routes.json'),
  JSON.stringify(functionsRoutesConfig, null, 2),
  'utf8'
);

console.log('✅ _routes.json a été créé avec succès dans le répertoire functions.');

// Copier les fichiers dans le répertoire out/functions
const outFunctionsDir = path.join(outDir, 'functions');
if (!fs.existsSync(outFunctionsDir)) {
  fs.mkdirSync(outFunctionsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outFunctionsDir, '_routes.json'),
  JSON.stringify(functionsRoutesConfig, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outFunctionsDir, '_middleware.js'),
  middlewareContent,
  'utf8'
);

console.log('✅ Fichiers copiés avec succès dans le répertoire out/functions.'); 