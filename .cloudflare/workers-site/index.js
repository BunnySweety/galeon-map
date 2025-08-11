import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false;

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        })
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    // Check if the URL is for a static file
    if (
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/images/') ||
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
      return await getAssetFromKV(event, options);
    }

    // Check if the URL is for a dynamic route like /hospitals/1
    const hospitalMatch = url.pathname.match(/^\/hospitals\/([^\/]+)$/);
    if (hospitalMatch) {
      // Try to serve the specific hospital page
      try {
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = `/hospitals/${hospitalMatch[1]}/index.html`;
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        return await getAssetFromKV(event, options);
      } catch (e) {
        // If specific hospital page doesn't exist, serve the main index.html
        options.mapRequestToAsset = req => {
          const url = new URL(req.url);
          url.pathname = '/index.html';
          return mapRequestToAsset(new Request(url.toString(), req));
        };
        return await getAssetFromKV(event, options);
      }
    }

    // Check if the URL is for an API route
    if (url.pathname.startsWith('/api/')) {
      // Try to serve the specific API file
      try {
        return await getAssetFromKV(event, options);
      } catch (e) {
        // If API file doesn't exist, return a 404 JSON response
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // For the homepage
    if (url.pathname === '/' || url.pathname === '') {
      return await getAssetFromKV(event, options);
    }

    // For all other routes, serve index.html
    options.mapRequestToAsset = req => {
      const url = new URL(req.url);
      url.pathname = '/index.html';
      return mapRequestToAsset(new Request(url.toString(), req));
    };

    const page = await getAssetFromKV(event, options);

    // Allow headers to be altered
    const response = new Response(page.body, page);

    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return response;
  } catch (e) {
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
          status: 404,
        });
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
}
