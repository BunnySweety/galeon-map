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

      // Gérer les routes dynamiques comme /hospitals/1
      const hospitalPageMatch = pathname.match(/^\/hospitals\/([^/]+)$/);
      if (hospitalPageMatch) {
        const id = hospitalPageMatch[1];
        console.log(`Hospital page ID: ${id}`);
        
        try {
          // Essayer de servir la page d'hôpital spécifique
          console.log(`Attempting to fetch: /hospitals/${id}/index.html`);
          const pageResponse = await fetch(new URL(`/hospitals/${id}/index.html`, url.origin));
          console.log(`Hospital ${id} page response status: ${pageResponse.status}`);
          
          if (pageResponse.ok) {
            const body = await pageResponse.text();
            return new Response(body, {
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=0, must-revalidate'
              },
              status: 200
            });
          } else {
            throw new Error(`Hospital page ${id} not found`);
          }
        } catch (e) {
          console.error(`Error serving hospital page: ${e}`);
          // Si la page spécifique n'existe pas, servir la page d'accueil
          console.log(`Falling back to index.html for hospital ${id}`);
          try {
            const indexResponse = await fetch(new URL('/index.html', url.origin));
            const body = await indexResponse.text();
            return new Response(body, {
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=0, must-revalidate'
              },
              status: 200
            });
          } catch (innerError) {
            console.error(`Error serving fallback for hospital: ${innerError}`);
            return new Response('Hospital page not found', { status: 404 });
          }
        }
      }

      // Gérer la page d'accueil
      if (pathname === '/' || pathname === '') {
        console.log('Serving homepage');
        try {
          console.log('Attempting to fetch: /index.html');
          const indexResponse = await fetch(new URL('/index.html', url.origin));
          console.log(`Homepage response status: ${indexResponse.status}`);
          
          if (indexResponse.ok) {
            const body = await indexResponse.text();
            return new Response(body, {
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=0, must-revalidate'
              },
              status: 200
            });
          } else {
            throw new Error('Homepage not found');
          }
        } catch (e) {
          console.error(`Error serving homepage: ${e}`);
          return new Response('Homepage not found', { status: 404 });
        }
      }

      // Pour toutes les autres routes, servir index.html
      console.log(`Serving index.html for route: ${pathname}`);
      try {
        console.log('Attempting to fetch: /index.html');
        const indexResponse = await fetch(new URL('/index.html', url.origin));
        console.log(`Index response status: ${indexResponse.status}`);
        
        if (indexResponse.ok) {
          const body = await indexResponse.text();
          return new Response(body, {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=0, must-revalidate'
            },
            status: 200
          });
        } else {
          throw new Error('Index page not found');
        }
      } catch (e) {
        console.error(`Error serving index: ${e}`);
        return new Response('Page not found', { status: 404 });
      }
    } catch (globalError) {
      console.error(`Global worker error: ${globalError}`);
      return new Response(`Server Error: ${globalError.message}`, { status: 500 });
    }
  }
}; 