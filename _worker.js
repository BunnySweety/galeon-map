export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Servir les fichiers statiques directement
    if (url.pathname.startsWith('/_next/') || 
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return fetch(request);
    }
    
    // Pour les routes API
    if (url.pathname.startsWith('/api/')) {
      return fetch(request);
    }
    
    // Pour les routes dynamiques
    if (url.pathname.match(/^\/hospitals\/[^\/]+$/)) {
      // Rediriger vers l'index.html et laisser le routage côté client s'en occuper
      const response = await fetch(new URL('/', url));
      return new Response(response.body, response);
    }
    
    // Pour la page d'accueil et toutes les autres routes
    try {
      // Essayer de servir la page demandée
      const response = await fetch(request);
      if (response.status === 404) {
        // Si 404, servir la page d'accueil
        return fetch(new URL('/', url));
      }
      return response;
    } catch (e) {
      // En cas d'erreur, servir la page d'accueil
      return fetch(new URL('/', url));
    }
  }
}; 