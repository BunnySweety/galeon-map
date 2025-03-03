// Middleware pour Cloudflare Pages Functions
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  // Servir les fichiers statiques directement
  if (pathname.startsWith('/_next/') || 
      pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return context.next();
  }
  
  // Pour les routes API
  if (pathname.startsWith('/api/')) {
    return context.next();
  }
  
  // Pour les routes dynamiques
  if (pathname.match(/^\/hospitals\/[^\/]+$/)) {
    return context.next();
  }
  
  // Pour la page d'accueil
  if (pathname === '/' || pathname === '') {
    return context.next();
  }
  
  // Pour toutes les autres routes, rediriger vers la page d'accueil
  return Response.redirect(`${url.origin}/`, 302);
} 