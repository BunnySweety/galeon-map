import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ===== EXPORT STATIQUE OPTIMISÉ =====
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // ===== PERFORMANCE GLOBALE =====
  poweredByHeader: false,
  compress: true,
  // swcMinify est maintenant par défaut dans Next.js 15

  // ===== OPTIMISATION IMAGES =====
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    formats: ['image/avif', 'image/webp'], // AVIF en priorité (meilleure compression)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ===== OPTIMISATION BUILD =====
  experimental: {
    // Optimisations experimentales stables (optimizeCss désactivé temporairement)
    optimizePackageImports: ['@lingui/core', '@lingui/react', 'mapbox-gl'], // Tree-shaking amélioré
  },

  // ===== GESTION D'ERREURS EN PRODUCTION =====
  eslint: {
    ignoreDuringBuilds: false, // Toujours vérifier ESLint
  },
  typescript: {
    ignoreBuildErrors: false, // Toujours vérifier TypeScript
  },

  // ===== CONFIGURATION DE BASE =====
  distDir: '.next',
  trailingSlash: true,
  generateEtags: false, // Désactiver ETags pour Cloudflare

  // ===== VARIABLES D'ENVIRONNEMENT OPTIMISÉES =====
  env: {
    // Variables essentielles seulement
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'v0.2.0',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev',
  },

  // ===== OPTIMISATION WEBPACK =====
  webpack: (config, { dev, isServer }) => {
    // Optimisations spécifiques à la production
    if (!dev && !isServer) {
      // Exclure react-query devtools de la production
      config.resolve.alias = {
        ...config.resolve.alias,
        '@tanstack/react-query-devtools': false,
      };

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            // Framework React (React + React-DOM)
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'framework-react',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Mapbox (très volumineux, toujours async)
            mapbox: {
              test: /[\\/]node_modules[\\/]mapbox-gl[\\/]/,
              name: 'mapbox',
              chunks: 'async',
              priority: 35,
              enforce: true,
            },
            // Lingui i18n
            lingui: {
              test: /[\\/]node_modules[\\/]@lingui[\\/]/,
              name: 'lingui',
              chunks: 'all',
              priority: 30,
            },
            // PDF generation (jspdf + autotable)
            pdf: {
              test: /[\\/]node_modules[\\/](jspdf|jspdf-autotable)[\\/]/,
              name: 'pdf',
              chunks: 'async',
              priority: 25,
            },
            // React Query
            query: {
              test: /[\\/]node_modules[\\/]@tanstack\/react-query[\\/]/,
              name: 'react-query',
              chunks: 'all',
              priority: 20,
            },
            // Date utilities
            dateUtils: {
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              name: 'date-utils',
              chunks: 'all',
              priority: 15,
            },
            // Zustand state management
            zustand: {
              test: /[\\/]node_modules[\\/]zustand[\\/]/,
              name: 'zustand',
              chunks: 'all',
              priority: 12,
            },
            // Autres dépendances communes
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'commons',
              chunks: 'all',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
        // Minimizer optimizations
        minimize: true,
      };
    }

    return config;
  },

  // ===== LOGGING OPTIMISÉ =====
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Headers désactivés pour l'export statique (incompatible)
  // Les headers de sécurité devront être configurés au niveau du serveur/CDN
};

export default withBundleAnalyzer(nextConfig);
