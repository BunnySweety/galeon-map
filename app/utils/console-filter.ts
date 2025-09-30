// Utilitaire pour filtrer les erreurs de console non critiques en développement
export const setupConsoleFilter = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;
    // eslint-disable-next-line no-console
    const originalConsoleWarn = console.warn;

    // eslint-disable-next-line no-console
    console.error = function (...args) {
      const errorMessage = args.join(' ');

      // Filtrer les erreurs HMR et de développement non critiques
      if (
        errorMessage.includes('HMR') ||
        errorMessage.includes('__N_SSP') ||
        errorMessage.includes('hook.js:608') ||
        errorMessage.includes('isrManifest') ||
        errorMessage.includes('hot-reloader-client') ||
        errorMessage.includes('Failed to load resource') ||
        errorMessage.includes('net::ERR_ABORTED 404') ||
        (errorMessage.includes('Canvas2D') && errorMessage.includes('fingerprinting'))
      ) {
        // Ignorer silencieusement ces erreurs spécifiques
        return;
      }

      // Passer les autres erreurs au gestionnaire d'origine
      originalConsoleError.apply(console, args);
    };

    // eslint-disable-next-line no-console
    console.warn = function (...args) {
      const warnMessage = args.join(' ');

      // Filtrer seulement les avertissements HMR et d'image non critiques
      if (
        warnMessage.includes('HMR') ||
        warnMessage.includes('Invalid message') ||
        warnMessage.includes('hot-reloader-client') ||
        warnMessage.includes('webpack-internal') ||
        warnMessage.includes('Image with src') ||
        warnMessage.includes('width or height modified')
      ) {
        // Ignorer silencieusement ces avertissements spécifiques
        return;
      }

      // Passer les autres avertissements au gestionnaire d'origine (y compris géolocalisation)
      originalConsoleWarn.apply(console, args);
    };
  }
};
