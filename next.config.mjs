// File: next.config.js
import UnoCSS from '@unocss/webpack';

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
    env: {
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    },
    webpack: (config, { isServer }) => {
      config.plugins.push(
        UnoCSS({
          cache: false
        })
      );

      // Optimize bundle size
      if (!isServer) {
        // Client-side optimizations
        config.optimization = {
          ...config.optimization,
          minimize: true,
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            maxAsyncRequests: 25,
            minSize: 5000,
            maxSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // Framework chunks
              framework: {
                chunks: 'all',
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                priority: 40,
                enforce: true
              },
              // Library chunks
              lib: {
                test: /[\\/]node_modules[\\/]/,
                priority: 30,
                minChunks: 2,
                reuseExistingChunk: true,
                name(module) {
                  return `lib-${module.identifier().split('/').slice(-2).join('-')}`;
                }
              },
              // Mapbox specific chunks
              mapbox: {
                test: /[\\/]node_modules[\\/]mapbox-gl[\\/]/,
                name: 'mapbox',
                priority: 20,
                enforce: true
              },
              // Styles
              styles: {
                name: 'styles',
                test: /\.(css|scss|sass)$/,
                chunks: 'all',
                enforce: true,
                priority: 10
              }
            }
          }
        };
      }

      return config;
    },
    output: 'standalone',
    
    typescript: {
      ignoreBuildErrors: false,
    },
    
    // Optimize production build
    minify: true,
    compress: true
}

export default nextConfig;