module.exports = {
  plugins: {
    '@unocss/postcss': {
      // Disable internal caching to prevent warnings
      cache: false,
      // Enable source maps in development
      sourceMap: process.env.NODE_ENV === 'development'
    },
  },
}; 