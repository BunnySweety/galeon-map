import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Chemin vers le répertoire de sortie
const outDir = path.join(rootDir, 'out');

// Contenu du fichier _routes.json
const routesConfig = {
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/*",
    "/images/*",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json"
  ],
  "routes": [
    {
      "src": "/hospitals/([^/]+)/?$",
      "dest": "/hospitals/$1/index.html"
    },
    {
      "src": "/api/hospitals/([^/]+)/?$",
      "dest": "/api/hospitals/$1/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1",
      "continue": true
    },
    {
      "src": "/(.*)",
      "status": 404,
      "dest": "/404.html"
    }
  ]
};

// Créer le fichier _routes.json dans le répertoire de sortie
fs.writeFileSync(
  path.join(outDir, '_routes.json'),
  JSON.stringify(routesConfig, null, 2),
  'utf8'
);

console.log('✅ _routes.json a été créé avec succès dans le répertoire de sortie.');

// Contenu du fichier _redirects
const redirectsContent = `/hospitals/:id  /hospitals/:id/index.html  200
/api/hospitals/:id  /api/hospitals/:id/index.html  200
/*  /index.html  200`;

// Créer le fichier _redirects dans le répertoire de sortie
fs.writeFileSync(
  path.join(outDir, '_redirects'),
  redirectsContent,
  'utf8'
);

console.log('✅ _redirects a été créé avec succès dans le répertoire de sortie.');

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

// Copier le fichier _routes.json dans le répertoire out/functions
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