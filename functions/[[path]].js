// Gestionnaire de routes pour Cloudflare Pages Functions
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  try {
    // Essayer de servir la page demandée
    return await context.next();
  } catch (e) {
    // En cas d'erreur, servir la page d'accueil
    return Response.redirect(`${url.origin}/`, 302);
  }
} 