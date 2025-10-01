import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

    // Performance monitoring for server-side
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (process.env.NODE_ENV === 'development') {
        if (event.level !== 'error' && event.level !== 'fatal') {
          return null;
        }
      }

      return event;
    },

    // Ignore specific server errors
    ignoreErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'socket hang up'],
  });
}
