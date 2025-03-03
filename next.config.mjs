// File: next.config.js
import UnoCSS from '@unocss/webpack';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'example.com',
          pathname: '/**',
        },
      ],
      unoptimized: true,
      domains: ['api.mapbox.com', 'maps.googleapis.com']
    },
    // Environment variables that will be available at build time on the client side
    env: {
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    },
    webpack: (config, { dev, isServer }) => {
      config.plugins.push(
        UnoCSS({
          cache: false
        })
      );

      // Désactiver le cache pour les modules problématiques
      config.module.rules.push({
        test: /[\\/]node_modules[\\/](unconfig|jiti)[\\/]/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
          },
        },
      });

      // Ignorer les modules problématiques dans le cache
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [
          /^(.+?[\\/]node_modules[\\/](?!(unconfig|jiti)[\\/]))/, // Exclure unconfig et jiti
        ],
      };

      // Ignorer les avertissements spécifiques
      config.ignoreWarnings = [
        { message: /Failed to parse source map/ },
        { message: /Critical dependency: the request of a dependency is an expression/ },
        { module: /unconfig[\\/]dist[\\/]index\.mjs/ },
        { module: /jiti[\\/]lib[\\/]jiti\.mjs/ }
      ];

      // Optimiser la taille des bundles
      if (!dev && !isServer) {
        // Activer la compression des chunks
        config.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 20000000, // Limiter la taille des chunks à 20 Mo
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Vérifier si module.context existe et contient le pattern recherché
                const packageNameMatch = module.context && module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                return packageNameMatch 
                  ? `npm.${packageNameMatch[1].replace('@', '')}`
                  : 'npm.unknown';
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        };
      }

      return config;
    },
    output: 'standalone',
    
    // Optimize build performance
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
    
    // Exclure les fichiers de cache webpack du déploiement (déplacé hors de experimental)
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        '.next/cache/**/*',
        'cache/**/*'
      ],
    },
    
    // Désactiver la génération de source maps en production
    productionBrowserSourceMaps: false,
}

export default nextConfig;