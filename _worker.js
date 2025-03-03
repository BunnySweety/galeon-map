import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = true;

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  console.log(`Worker handling request for: ${url.pathname}`);
  console.log(`Full URL: ${event.request.url}`);

  try {
    // Check if the URL is for a static file
    if (
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/static/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.json') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname === '/favicon.ico' ||
      url.pathname === '/robots.txt' ||
      url.pathname === '/sitemap.xml' ||
      url.pathname === '/manifest.json'
    ) {
      // Serve the static file directly
      console.log(`Serving static file: ${url.pathname}`);
      return await getAssetFromKV(event, options);
    }

    // Check if the URL is for a dynamic route like /hospitals/1
    const hospitalMatch = url.pathname.match(/^\/hospitals\/([^/]+)$/);
    if (hospitalMatch) {
      console.log(`Hospital page ID: ${hospitalMatch[1]}`);
      // Try to serve the specific hospital page
      try {
        console.log(`Attempting to fetch: /hospitals/${hospitalMatch[1]}/index.html`);
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = `/hospitals/${hospitalMatch[1]}/index.html`;
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        const response = await getAssetFromKV(event, options);
        console.log(`Hospital ${hospitalMatch[1]} page response status: ${response.status}`);
        
        // Add headers to the response
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Content-Type', 'text/html');
        newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
        return newResponse;
      } catch (e) {
        console.error(`Error serving hospital page: ${e}`);
        // If specific hospital page doesn't exist, serve the main index.html
        console.log(`Falling back to index.html for hospital ${hospitalMatch[1]}`);
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = '/index.html';
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        try {
          const response = await getAssetFromKV(event, options);
          const newResponse = new Response(response.body, response);
          newResponse.headers.set('Content-Type', 'text/html');
          newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
          return newResponse;
        } catch (innerError) {
          console.error(`Error serving fallback for hospital: ${innerError}`);
          return new Response('Hospital page not found', { status: 404 });
        }
      }
    }

    // Check if the URL is for an API route
    if (url.pathname.startsWith('/api/')) {
      console.log(`Handling API route: ${url.pathname}`);
      // Try to serve the specific API file
      try {
        const apiHospitalMatch = url.pathname.match(/^\/api\/hospitals\/([^/]+)$/);
        if (apiHospitalMatch) {
          console.log(`API hospital ID: ${apiHospitalMatch[1]}`);
          console.log(`Attempting to fetch: /api/hospitals/${apiHospitalMatch[1]}/index.html`);
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = `/api/hospitals/${apiHospitalMatch[1]}/index.html`;
            return mapRequestToAsset(new Request(url.toString(), req));
          };
          const response = await getAssetFromKV(event, options);
          console.log(`API hospital ${apiHospitalMatch[1]} response status: ${response.status}`);
          
          // Return JSON response
          return new Response(response.body, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            status: 200
          });
        }

        if (url.pathname === '/api/hospitals') {
          console.log('Serving main API hospitals route');
          console.log('Attempting to fetch: /api/hospitals/index.html');
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = '/api/hospitals/index.html';
            return mapRequestToAsset(new Request(url.toString(), req));
          };
          const response = await getAssetFromKV(event, options);
          console.log(`API hospitals response status: ${response.status}`);
          
          // Return JSON response
          return new Response(response.body, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            status: 200
          });
        }
      } catch (e) {
        console.error(`Error serving API: ${e}`);
        // If API file doesn't exist, return a 404 JSON response
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // For the homepage
    if (url.pathname === '/' || url.pathname === '') {
      console.log('Serving homepage');
      console.log('Attempting to fetch: /index.html');
      try {
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = '/index.html';
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        const response = await getAssetFromKV(event, options);
        console.log(`Homepage response status: ${response.status}`);
        
        // Add headers to the response
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Content-Type', 'text/html');
        newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
        return newResponse;
      } catch (e) {
        console.error(`Error serving homepage: ${e}`);
        return new Response('Homepage not found', { status: 404 });
      }
    }

    // For all other routes, serve index.html
    console.log(`Serving index.html for unknown route: ${url.pathname}`);
    console.log('Attempting to fetch fallback: /index.html');
    options.mapRequestToAsset = req => {
      const url = new URL(req.url);
      url.pathname = '/index.html';
      return mapRequestToAsset(new Request(url.toString(), req));
    };

    try {
      const page = await getAssetFromKV(event, options);
      console.log(`Fallback response status: ${page.status}`);

      // Allow headers to be altered
      const response = new Response(page.body, page);

      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      response.headers.set('Content-Type', 'text/html');

      return response;
    } catch (e) {
      console.error(`Error serving fallback: ${e}`);
      
      // If an error is thrown try to serve the 404.html page
      if (!DEBUG) {
        try {
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = '/404.html';
            return mapRequestToAsset(new Request(url.toString(), req));
          };
          const notFoundResponse = await getAssetFromKV(event, options);
          return new Response(notFoundResponse.body, {
            ...notFoundResponse,
            status: 404
          });
        } catch (e) {
          console.error(`Error serving 404 page: ${e}`);
        }
      }

      return new Response('Page not found', { status: 404 });
    }
  } catch (globalError) {
    console.error(`Global worker error: ${globalError}`);
    return new Response(`Server Error: ${globalError.message}`, { status: 500 });
  }
} 