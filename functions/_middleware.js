// Middleware pour Cloudflare Pages Functions
export async function onRequest(context) {
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
    const hospitalIdMatch = pathname.match(/^\/api\/hospitals\/([^\/]+)$/);
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
  const hospitalPageMatch = pathname.match(/^\/hospitals\/([^\/]+)$/);
  if (hospitalPageMatch) {
    return context.next();
  }

  // Gérer la page d'accueil
  if (pathname === '/' || pathname === '') {
    return context.next();
  }

  // Rediriger vers la page d'accueil pour les routes non reconnues
  return Response.redirect(new URL('/', request.url), 302);
} 