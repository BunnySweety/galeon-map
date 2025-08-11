// Worker pour Cloudflare Pages en mode avancé
// Ce worker gère les requêtes entrantes et les redirige vers les bonnes destinations

// Export the handler for Cloudflare Workers
const worker = {
  async fetch(request, env /*, ctx */) {
    // Removed unused ctx
    // Add locale handling logic here if needed, using request headers or URL
    // Example: let locale = request.headers.get('accept-language')?.split(',')[0] || 'en';

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // En cas d'erreur, renvoyer une réponse d'erreur
      console.error('Erreur lors du traitement de la requête:', e);

      return new Response(
        JSON.stringify({
          error: 'Une erreur est survenue lors du traitement de la requête',
          message: e.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

// Default export
export default worker;
