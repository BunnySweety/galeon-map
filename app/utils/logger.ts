// Utilitaire de logging conditionnel pour éviter les logs en production
const isDevelopment = process.env.NODE_ENV === 'development';

// Type pour les arguments de logging
type LogArgs = [message?: unknown, ...optionalParams: unknown[]];

export const logger = {
  log: (...args: LogArgs) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  warn: (...args: LogArgs) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  error: (...args: LogArgs) => {
    // Les erreurs sont toujours affichées
    // eslint-disable-next-line no-console
    console.error(...args);
  },

  info: (...args: LogArgs) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  debug: (...args: LogArgs) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
};

// Export par défaut pour faciliter l'import
export default logger;
