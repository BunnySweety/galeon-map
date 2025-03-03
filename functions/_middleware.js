// Middleware pour Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(`Middleware handling request for: ${pathname}`);

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
    console.log(`Serving static file: ${pathname}`);
    return next();
  }

  // Gérer les routes API
  if (pathname.startsWith('/api/')) {
    console.log(`Handling API route: ${pathname}`);
    
    // Pour les routes API dynamiques comme /api/hospitals/1
    const hospitalIdMatch = pathname.match(/^\/api\/hospitals\/([^/]+)$/);
    if (hospitalIdMatch) {
      const id = hospitalIdMatch[1];
      console.log(`API hospital ID: ${id}`);
      
      try {
        // Essayer de servir le fichier API spécifique
        const apiResponse = await env.ASSETS.fetch(new URL(`/api/hospitals/${id}/index.html`, request.url));
        return new Response(apiResponse.body, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: 200
        });
      } catch (e) {
        console.error(`Error serving API hospital: ${e}`);
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
        console.error(`Error serving API hospitals: ${e}`);
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
  const hospitalPageMatch = pathname.match(/^\/hospitals\/([^/]+)$/);
  if (hospitalPageMatch) {
    const id = hospitalPageMatch[1];
    console.log(`Hospital page ID: ${id}`);
    
    try {
      // Essayer de servir la page d'hôpital spécifique
      const pageResponse = await env.ASSETS.fetch(new URL(`/hospitals/${id}/index.html`, request.url));
      return new Response(pageResponse.body, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        status: 200
      });
    } catch (e) {
      console.error(`Error serving hospital page: ${e}`);
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
      console.error(`Error serving homepage: ${e}`);
      return new Response('Homepage not found', { status: 404 });
    }
  }

  // Pour toutes les autres routes, servir index.html sans redirection
  console.log(`Serving index.html for unknown route: ${pathname}`);
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
    console.error(`Error serving fallback: ${e}`);
    return new Response('Page not found', { status: 404 });
  }
} 