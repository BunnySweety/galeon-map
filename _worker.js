export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    console.log(`Worker handling request for: ${pathname}`);
    console.log(`Full URL: ${request.url}`);

    try {
      // Gérer les fichiers statiques
      if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/images/') ||
        pathname.startsWith('/static/') ||
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
        return fetch(request);
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
            const apiResponse = await fetch(new URL(`/api/hospitals/${id}/index.html`, url.origin));
            console.log(`API hospital ${id} response status: ${apiResponse.status}`);
            
            if (apiResponse.ok) {
              const body = await apiResponse.text();
              return new Response(body, {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                status: 200
              });
            } else {
              throw new Error(`API hospital ${id} not found`);
            }
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
            const apiResponse = await fetch(new URL('/api/hospitals/index.html', url.origin));
            console.log(`API hospitals response status: ${apiResponse.status}`);
            
            if (apiResponse.ok) {
              const body = await apiResponse.text();
              return new Response(body, {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                status: 200
              });
            } else {
              throw new Error('API hospitals not found');
            }
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

      // Pour toutes les autres routes, servir une page HTML directement
      console.log(`Serving fallback HTML for route: ${pathname}`);
      
      const fallbackHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeon Community Hospital Map</title>
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
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #0070f3;
      color: white;
      border-radius: 4px;
    }
    a:hover {
      background-color: #0051a8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Galeon Community Hospital Map</h1>
    <p>Bienvenue sur la carte des hôpitaux communautaires Galeon.</p>
    <p>Cette application est en cours de développement.</p>
    <a href="https://github.com/BunnySweety/galeon-map" target="_blank">Voir le code source sur GitHub</a>
  </div>
</body>
</html>`;
      
      return new Response(fallbackHtml, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        status: 200
      });
    } catch (error) {
      console.error(`Global error: ${error}`);
      
      // En cas d'erreur, retourner une page d'erreur HTML
      const errorHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erreur - Galeon Community Hospital Map</title>
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
    .error {
      color: #e00;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    a {
      color: #0070f3;
      text-decoration: none;
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #0070f3;
      color: white;
      border-radius: 4px;
    }
    a:hover {
      background-color: #0051a8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Erreur</h1>
    <p>Une erreur s'est produite lors du chargement de l'application.</p>
    <p>Veuillez réessayer ultérieurement ou contacter l'administrateur.</p>
    <div class="error">Détails: ${error.message || 'Erreur inconnue'}</div>
    <a href="/">Retour à l'accueil</a>
  </div>
</body>
</html>`;
      
      return new Response(errorHtml, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        status: 500
      });
    }
  }
};
