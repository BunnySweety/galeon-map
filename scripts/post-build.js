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

// Copier les fichiers de configuration de Cloudflare Pages depuis public
const publicConfigFiles = ['_routes.json', '_redirects', '_headers'];

for (const file of publicConfigFiles) {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(outDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ ${file} a été copié depuis public vers le répertoire de sortie.`);
  } else {
    console.log(`⚠️ ${file} n'existe pas dans le répertoire public.`);
  }
}

// Copier les fichiers de configuration de Cloudflare Pages depuis la racine
const rootConfigFiles = ['_routes.json', '_redirects', '_headers', '_worker.js', 'index.html'];

for (const file of rootConfigFiles) {
  const sourcePath = path.join(rootDir, file);
  const destPath = path.join(outDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ ${file} a été copié depuis la racine vers le répertoire de sortie.`);
  } else {
    console.log(`⚠️ ${file} n'existe pas à la racine du projet.`);
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

// Créer un fichier index.html à la racine du répertoire de sortie (copie de l'index.html existant)
if (fs.existsSync(path.join(outDir, 'index.html'))) {
  const indexHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
  
  // Créer des copies de index.html pour les routes dynamiques
  const routes = [
    '/hospitals/1',
    '/hospitals/2',
    '/hospitals/3',
    '/hospitals/4',
    '/hospitals/5',
    '/hospitals/6',
    '/hospitals/7',
    '/hospitals/8',
    '/hospitals/9',
    '/hospitals/10',
    '/hospitals/11',
    '/hospitals/12',
    '/hospitals/13',
    '/hospitals/14',
    '/hospitals/15',
    '/hospitals/16'
  ];
  
  for (const route of routes) {
    const routeDir = path.join(outDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml, 'utf8');
    console.log(`✅ index.html a été copié vers ${route}/index.html`);
  }
}

// Créer le répertoire functions s'il n'existe pas
const functionsDir = path.join(rootDir, 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Créer un fichier _worker.js à la racine du projet
const workerContent = `
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

const DEBUG = false;

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  try {
    // Check if the URL is for a static file
    if (
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.json') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/robots.txt' ||
      url.pathname === '/sitemap.xml' ||
      url.pathname === '/manifest.json'
    ) {
      // Serve the static file directly
      return await getAssetFromKV(event, options);
    }

    // Check if the URL is for a dynamic route like /hospitals/1
    const hospitalMatch = url.pathname.match(/^\\/hospitals\\/([^/]+)$/);
    if (hospitalMatch) {
      // Try to serve the specific hospital page
      try {
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = \`/hospitals/\${hospitalMatch[1]}/index.html\`;
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        return await getAssetFromKV(event, options);
      } catch (e) {
        // If specific hospital page doesn't exist, serve the main index.html
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = '/index.html';
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        return await getAssetFromKV(event, options);
      }
    }

    // Check if the URL is for an API route
    if (url.pathname.startsWith('/api/')) {
      // Try to serve the specific API file
      try {
        const apiHospitalMatch = url.pathname.match(/^\\/api\\/hospitals\\/([^/]+)$/);
        if (apiHospitalMatch) {
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = \`/api/hospitals/\${apiHospitalMatch[1]}/index.html\`;
            return mapRequestToAsset(new Request(url.toString(), req));
          };
          return await getAssetFromKV(event, options);
        }

        if (url.pathname === '/api/hospitals') {
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = '/api/hospitals/index.html';
            return mapRequestToAsset(new Request(url.toString(), req));
          };
          return await getAssetFromKV(event, options);
        }
      } catch (e) {
        // If API file doesn't exist, return a 404 JSON response
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // For the homepage
    if (url.pathname === '/' || url.pathname === '') {
      return await getAssetFromKV(event, options);
    }

    // For all other routes, serve index.html
    options.mapRequestToAsset = req => {
      const url = new URL(req.url);
      url.pathname = '/index.html';
      return mapRequestToAsset(new Request(url.toString(), req));
    };

    const page = await getAssetFromKV(event, options);

    // Allow headers to be altered
    const response = new Response(page.body, page);

    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return response;
  } catch (e) {
    // If an error is thrown try to serve the 404.html page
    if (!DEBUG) {
      try {
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = '/404.html';
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        const notFoundResponse = await getAssetFromKV(event, options);
        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404
        });
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
}
`;

fs.writeFileSync(path.join(rootDir, '_worker.js'), workerContent, 'utf8');
console.log('✅ _worker.js a été créé avec succès à la racine du projet.');

// Contenu du fichier _middleware.js
const middlewareContent = `// Middleware pour Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(\`Middleware handling request for: \${pathname}\`);

  // Gérer les fichiers statiques
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json'
  ) {
    console.log(\`Serving static file: \${pathname}\`);
    return next();
  }

  // Gérer les routes API
  if (pathname.startsWith('/api/')) {
    console.log(\`Handling API route: \${pathname}\`);
    
    // Pour les routes API dynamiques comme /api/hospitals/1
    const hospitalIdMatch = pathname.match(/^\\/api\\/hospitals\\/([^/]+)$/);
    if (hospitalIdMatch) {
      const id = hospitalIdMatch[1];
      console.log(\`API hospital ID: \${id}\`);
      
      try {
        // Essayer de servir le fichier API spécifique
        const apiResponse = await env.ASSETS.fetch(new URL(\`/api/hospitals/\${id}/index.html\`, request.url));
        return new Response(apiResponse.body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: 200
        });
      } catch (e) {
        console.error(\`Error serving API hospital: \${e}\`);
        // Retourner une réponse JSON 404
        return new Response(JSON.stringify({ error: 'Hospital not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    
    // Pour la route API principale /api/hospitals
    if (pathname === '/api/hospitals') {
      console.log('Serving main API hospitals route');
      try {
        const apiResponse = await env.ASSETS.fetch(new URL('/api/hospitals/index.html', request.url));
        return new Response(apiResponse.body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: 200
        });
      } catch (e) {
        console.error(\`Error serving API hospitals: \${e}\`);
        return new Response(JSON.stringify({ error: 'Hospitals not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  }

  // Gérer les routes dynamiques comme /hospitals/1
  const hospitalPageMatch = pathname.match(/^\\/hospitals\\/([^/]+)$/);
  if (hospitalPageMatch) {
    const id = hospitalPageMatch[1];
    console.log(\`Hospital page ID: \${id}\`);
    
    try {
      // Essayer de servir la page d'hôpital spécifique
      const pageResponse = await env.ASSETS.fetch(new URL(\`/hospitals/\${id}/index.html\`, request.url));
      return new Response(pageResponse.body, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        status: 200
      });
    } catch (e) {
      console.error(\`Error serving hospital page: \${e}\`);
      // Si la page spécifique n'existe pas, servir la page d'accueil
      const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
      return new Response(indexResponse.body, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        status: 200
      });
    }
  }

  // Gérer la page d'accueil
  if (pathname === '/' || pathname === '') {
    console.log('Serving homepage');
    try {
      const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
      return new Response(indexResponse.body, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        status: 200
      });
    } catch (e) {
      console.error(\`Error serving homepage: \${e}\`);
      return new Response('Homepage not found', { status: 404 });
    }
  }

  // Pour toutes les autres routes, servir index.html sans redirection
  console.log(\`Serving index.html for unknown route: \${pathname}\`);
  try {
    const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
    return new Response(indexResponse.body, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=0, must-revalidate'
      },
      status: 200
    });
  } catch (e) {
    console.error(\`Error serving fallback: \${e}\`);
    return new Response('Page not found', { status: 404 });
  }
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