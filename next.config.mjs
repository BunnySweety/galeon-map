// Configuration pour l'export statique
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Gardé de mjs

  // Fait output: 'export' conditionnel
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Security headers améliorés
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // CSP plus robuste pour la production
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://events.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.mapbox.com https://api.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://events.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ];

    // CSP plus permissif en développement
    const devCspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: localhost:* 127.0.0.1:*",
      "style-src 'self' 'unsafe-inline' https: http:",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https: http: data:",
      "connect-src 'self' https: http: ws: wss: localhost:* 127.0.0.1:*",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    const csp = isDev ? devCspDirectives.join('; ') : cspDirectives.join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), autoplay=(), encrypted-media=(), fullscreen=(self), picture-in-picture=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          // {
          //   key: 'Cross-Origin-Opener-Policy',
          //   value: 'same-origin-allow-popups',
          // },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // --- Fusionné de next.config.js ET next.config.mjs ---
  images: {
    // remotePatterns: [ // Possiblement nécessaire si vous utilisez des domaines spécifiques
    //   {
    //     protocol: 'https',
    //     hostname: '*.galeon.community',
    //   },
    // ],
    formats: ['image/avif', 'image/webp'], // De .js
    // Utiliser le service d'images de Cloudflare
    loader: 'custom', // De .js
    loaderFile: './cloudflare-image-loader.js', // De .js
    unoptimized: true, // De .js (et .mjs) - Nécessaire pour l'export statique
    domains: ['api.mapbox.com', 'maps.googleapis.com'], // De .mjs
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Désactiver les avertissements ESLint pour le déploiement
  eslint: {
    // Avertissements ignorés lors du build
    ignoreDuringBuilds: true, // De .js (et .mjs)
  },
  typescript: {
    // De .js (et .mjs)
    // Erreurs de type ignorées lors du build
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs de build (Options de .js)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  distDir: '.next', // De .js
  trailingSlash: true, // De .js
  skipTrailingSlashRedirect: true, // De .js
  skipMiddlewareUrlNormalize: true, // De .js

  // Options expérimentales (De .js)
  experimental: {
    disableOptimizedLoading: true,
    forceSwcTransforms: true,
    optimizePackageImports: ['date-fns', 'zustand'],
    webVitalsAttribution: ['CLS', 'LCP'],
    gzipSize: true,
    // Nouvelles optimisations
    optimizeCss: false, // Éviter les erreurs critters
  },
  // --- Fin de la fusion ---

  env: {
    // Gardé de mjs
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'development',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    NEXT_PUBLIC_USE_MAPBOX_CDN: process.env.NEXT_PUBLIC_USE_MAPBOX_CDN || 'true',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev',
  },
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimisations avancées pour la production
      config.optimization.minimize = true;
      config.optimization.concatenateModules = true;
      config.optimization.providedExports = true;
      
      // Tree-shaking amélioré
      config.optimization.innerGraph = true;
      config.optimization.mangleExports = 'size';
    }

    // Always use npm package instead of CDN for better compatibility
    if (false) { // Disabled CDN externalization
      config.externals = config.externals || [];
      if (!isServer) {
        config.externals.push({
          'mapbox-gl': 'mapboxgl',
        });
      }
    }

    // Désactivation temporaire du code splitting personnalisé pour éviter des incohérences de chunks (.css chargés comme <script>)
    // Laisser Next.js gérer le découpage des chunks par défaut.
    // if (!isServer) {
    //   config.optimization.splitChunks = {
    //     ...config.optimization.splitChunks,
    //     chunks: 'all',
    //     maxInitialRequests: Infinity,
    //     minSize: 20000, // 20KB
    //     cacheGroups: {
    //       framework: {
    //         test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
    //         name: 'framework',
    //         chunks: 'all',
    //         priority: 40,
    //         enforce: true,
    //       },
    //       lib: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name: 'lib',
    //         chunks: 'all',
    //         priority: 30,
    //         enforce: true,
    //         reuseExistingChunk: true,
    //       },
    //       mapboxgl: {
    //         test: /[\\/]node_modules[\\/]mapbox-gl[\\/]/,
    //         name: 'mapboxgl',
    //         chunks: 'all',
    //         priority: 20,
    //         enforce: true,
    //       },
    //       commons: {
    //         name: 'commons',
    //         chunks: 'all',
    //         priority: 10,
    //         reuseExistingChunk: true,
    //       },
    //     },
    //   };
    // }

    return config;
  },

  // Réduire les logs en développement
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default withBundleAnalyzer(nextConfig);
