// Utilitaires pour optimiser les performances de l'application

import { useCallback, useRef } from 'react';
import logger from './logger';
import type { Metric } from 'web-vitals';

/**
 * Hook pour débouncer les fonctions (éviter les appels trop fréquents)
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook pour throttler les fonctions (limiter la fréquence d'exécution)
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Mesurer les performances d'une fonction
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  logger.debug(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);

  return result;
}

/**
 * Mesurer les performances d'une fonction asynchrone
 */
export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  logger.debug(`Async Performance [${name}]: ${(end - start).toFixed(2)}ms`);

  return result;
}

/**
 * Optimiser les images en lazy loading
 */
export const imageOptimization = {
  // Configuration pour Next.js Image
  defaultProps: {
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },

  // Générer un placeholder blur
  generateBlurDataURL: (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
  },
};

/**
 * Cache pour optimiser les requêtes réseau
 */
const networkCache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Récupérer depuis le cache ou faire une nouvelle requête
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = networkCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    logger.debug(`Cache hit for key: ${key}`);
    return cached.data as T;
  }

  logger.debug(`Cache miss for key: ${key}, fetching...`);
  const data = await fetcher();

  networkCache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Nettoyer le cache expiré
 */
export function cleanExpiredCache(ttl: number = DEFAULT_TTL): void {
  const now = Date.now();

  for (const [key, value] of networkCache.entries()) {
    if (now - value.timestamp >= ttl) {
      networkCache.delete(key);
    }
  }
}

/**
 * Optimiser les re-rendus React
 */
export const reactOptimization = {
  // Mémoriser des valeurs coûteuses
  memoizeExpensiveValue: <T>(factory: () => T) => {
    // Cette fonction devrait être utilisée avec useMemo dans un composant
    return factory;
  },
};

// Types pour les métriques de performance
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

interface WebVitalMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Seuils pour les Core Web Vitals (2024)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

// Fonction pour déterminer le rating d'une métrique
function getRating(metricName: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Fonction pour envoyer les métriques (en développement, on log seulement)
function sendToAnalytics(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`📊 Web Vital: ${metric.name}`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: metric.delta ? Math.round(metric.delta) : undefined,
      id: metric.id,
    });
  }
  
  // En production, vous pourriez envoyer vers Google Analytics, Vercel Analytics, etc.
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Exemple pour Google Analytics 4
    if ('gtag' in window) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
        custom_parameter_2: metric.id,
      });
    }
    
    // Exemple pour Vercel Analytics
    if ('va' in window) {
      (window as any).va('track', 'Web Vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    }
  }
}

// Fonction principale pour mesurer les Web Vitals
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals pour éviter les erreurs SSR
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      const webVitalMetric: WebVitalMetric = {
        ...metric,
        rating: getRating('CLS', metric.value),
      };
      sendToAnalytics(webVitalMetric);
    });

    // First Contentful Paint
    onFCP((metric: Metric) => {
      const webVitalMetric: WebVitalMetric = {
        ...metric,
        rating: getRating('FCP', metric.value),
      };
      sendToAnalytics(webVitalMetric);
    });

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      const webVitalMetric: WebVitalMetric = {
        ...metric,
        rating: getRating('LCP', metric.value),
      };
      sendToAnalytics(webVitalMetric);
    });

    // Time to First Byte
    onTTFB((metric: Metric) => {
      const webVitalMetric: WebVitalMetric = {
        ...metric,
        rating: getRating('TTFB', metric.value),
      };
      sendToAnalytics(webVitalMetric);
    });

    // Interaction to Next Paint (remplace FID dans web-vitals v4)
    onINP((metric: Metric) => {
      const webVitalMetric: WebVitalMetric = {
        ...metric,
        rating: getRating('INP', metric.value),
      };
      sendToAnalytics(webVitalMetric);
    });
  }).catch((error) => {
    logger.error('Failed to load web-vitals:', error);
  });
}

// Fonction pour mesurer les métriques personnalisées
export function measureCustomMetrics() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  // Mesurer le temps de chargement de la page
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP Connection': navigation.connectEnd - navigation.connectStart,
        'TLS Handshake': navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
        'Request': navigation.responseStart - navigation.requestStart,
        'Response': navigation.responseEnd - navigation.responseStart,
        'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
        'Resource Loading': navigation.loadEventStart - navigation.domContentLoadedEventStart,
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('📈 Navigation Timing:', metrics);
      }
    }
  });

  // Mesurer les ressources lourdes
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 100) { // Ressources qui prennent plus de 100ms
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`🐌 Slow resource: ${entry.name} (${Math.round(entry.duration)}ms)`);
        }
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Fonction pour mesurer les métriques de bundle
export function measureBundleMetrics() {
  if (typeof window === 'undefined') return;

  // Mesurer la taille des chunks JavaScript
  const observer = new PerformanceObserver((list) => {
    const jsResources = list.getEntries().filter(entry => 
      entry.name.includes('.js') && entry.name.includes('_next/static')
    );

    let totalJSSize = 0;
    const chunkSizes: Record<string, number> = {};

    jsResources.forEach((entry: any) => {
      if (entry.transferSize) {
        totalJSSize += entry.transferSize;
        const chunkName = entry.name.split('/').pop() || 'unknown';
        chunkSizes[chunkName] = entry.transferSize;
      }
    });

    if (process.env.NODE_ENV === 'development' && totalJSSize > 0) {
      logger.info('📦 Bundle Metrics:', {
        totalJSSize: `${Math.round(totalJSSize / 1024)}KB`,
        chunkCount: Object.keys(chunkSizes).length,
        largestChunk: Object.entries(chunkSizes)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
      });
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Fonction pour détecter les problèmes de performance
export function detectPerformanceIssues() {
  if (typeof window === 'undefined') return;

  // Détecter les long tasks (> 50ms)
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`⚠️ Long task detected: ${Math.round(entry.duration)}ms`);
        }
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask pas supporté dans tous les navigateurs
    }
  }

  // Détecter les layout shifts importants
  if ('PerformanceObserver' in window) {
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).value > 0.1) { // Shift important
          if (process.env.NODE_ENV === 'development') {
            logger.warn(`📐 Large layout shift: ${(entry as any).value.toFixed(4)}`);
          }
        }
      }
    });

    try {
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // layout-shift pas supporté dans tous les navigateurs
    }
  }
}

// Fonction principale pour initialiser tous les monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  measureWebVitals();
  measureCustomMetrics();
  measureBundleMetrics();
  detectPerformanceIssues();

  if (process.env.NODE_ENV === 'development') {
    logger.info('🚀 Performance monitoring initialized');
  }
}

// Fonction pour obtenir un rapport de performance
export function getPerformanceReport(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    navigation: navigation ? {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      firstByte: Math.round(navigation.responseStart - navigation.fetchStart),
    } : null,
    paint: paint.reduce((acc, entry) => {
      acc[entry.name] = Math.round(entry.startTime);
      return acc;
    }, {} as Record<string, number>),
    memory: (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024),
    } : null,
  };
}

// Export des types pour utilisation externe
export type { PerformanceMetric, WebVitalMetric };
