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
}

export default nextConfig;