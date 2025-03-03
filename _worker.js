export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

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
      return fetch(request);
    }

    // Gérer les routes API
    if (pathname.startsWith('/api/')) {
      // Pour les routes API dynamiques comme /api/hospitals/1
      const hospitalIdMatch = pathname.match(/^\/api\/hospitals\/([^\/]+)$/);
      if (hospitalIdMatch) {
        const id = hospitalIdMatch[1];
        // Rediriger vers le fichier HTML statique
        const newUrl = new URL(`/api/hospitals/${id}/index.html`, url.origin);
        return fetch(new Request(newUrl, request));
      }
      
      // Pour la route API principale /api/hospitals
      if (pathname === '/api/hospitals') {
        return fetch(new Request(new URL('/api/hospitals/index.html', url.origin), request));
      }
    }

    // Gérer les routes dynamiques comme /hospitals/1
    const hospitalPageMatch = pathname.match(/^\/hospitals\/([^\/]+)$/);
    if (hospitalPageMatch) {
      const id = hospitalPageMatch[1];
      // Rediriger vers le fichier HTML statique
      const newUrl = new URL(`/hospitals/${id}/index.html`, url.origin);
      return fetch(new Request(newUrl, request));
    }

    // Gérer la page d'accueil
    if (pathname === '/' || pathname === '') {
      return fetch(new Request(new URL('/index.html', url.origin), request));
    }

    // Pour toutes les autres routes, rediriger vers index.html
    return fetch(new Request(new URL('/index.html', url.origin), request));
  }
}; 