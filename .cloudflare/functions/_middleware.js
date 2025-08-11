// Middleware pour Cloudflare Workers
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  // Gérer les redirections pour les routes dynamiques
  if (pathname.match(/^\/hospitals\/[^\/]+$/)) {
    return context.next();
  }

  // Gérer les redirections pour les routes API
  if (pathname.match(/^\/api\/hospitals(\/[^\/]+)?$/)) {
    return context.next();
  }

  // Rediriger vers la page d'accueil si la route n'est pas reconnue
  if (
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    pathname !== '/' &&
    !pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return Response.redirect(`${url.origin}/`, 302);
  }

  return context.next();
}
