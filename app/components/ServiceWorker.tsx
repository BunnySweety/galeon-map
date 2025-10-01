'use client';

import { useEffect, useState } from 'react';
import logger from '../utils/logger';

export default function ServiceWorker() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

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
            updateViaCache: 'none', // Always check for updates
          });

          // Check for updates every hour
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000
          );

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  logger.info('New content available! Update ready.');
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });

          // Check if there's already a waiting worker
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdatePrompt(true);
          }

          logger.info('Service Worker registered successfully');
        } catch (error) {
          logger.error('Service Worker registration failed:', error);
        }
      };

      registerSW();

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #479AF3 0%, #3B82F6 100%)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        maxWidth: '320px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
        🎉 New Update Available!
      </div>
      <div style={{ marginBottom: '16px', fontSize: '13px', opacity: 0.95 }}>
        A new version of the app is ready. Refresh to get the latest features.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleUpdate}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: 'white',
            color: '#479AF3',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
