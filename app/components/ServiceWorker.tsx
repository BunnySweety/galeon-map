'use client';

import { useEffect } from 'react';
import logger from '../utils/logger';

export default function ServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, inform the user
                  logger.info('New content available! Please refresh the page.');
                  
                  // You could show a toast notification here
                  if (typeof window !== 'undefined' && 'confirm' in window) {
                    const shouldRefresh = window.confirm(
                      'New content is available! Would you like to refresh the page?'
                    );
                    if (shouldRefresh) {
                      window.location.reload();
                    }
                  }
                }
              });
            }
          });

          logger.info('Service Worker registered successfully');
        } catch (error) {
          logger.error('Service Worker registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  return null;
} 