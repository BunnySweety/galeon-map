// Middleware pour Cloudflare Pages Functions
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

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
    return context.next();
  }

  // Gérer les routes API
  if (pathname.startsWith('/api/')) {
    // Pour les routes API dynamiques comme /api/hospitals/1
    const hospitalIdMatch = pathname.match(/^\/api\/hospitals\/([^/]+)$/);
    if (hospitalIdMatch) {
      return context.next();
    }
    
    // Pour la route API principale /api/hospitals
    if (pathname === '/api/hospitals') {
      return context.next();
    }
  }

  // Gérer les routes dynamiques comme /hospitals/1
  const hospitalPageMatch = pathname.match(/^\/hospitals\/([^/]+)$/);
  if (hospitalPageMatch) {
    return context.next();
  }

  // Gérer la page d'accueil
  if (pathname === '/' || pathname === '') {
    return context.next();
  }

  // Pour toutes les autres routes, servir index.html sans redirection
  const response = await context.env.ASSETS.fetch(new URL('/index.html', request.url));
  return new Response(response.body, {
    headers: response.headers,
    status: 200
  });
} 