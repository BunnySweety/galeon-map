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
    // Environment variables that will be available at build time on the client side
    env: {
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    },
    webpack: (config) => {
      config.plugins.push(
        UnoCSS({
          cache: false
        })
      );
      return config;
    },
    output: 'standalone'
};

export default nextConfig;