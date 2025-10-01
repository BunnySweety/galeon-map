// File: app/utils/analytics.ts
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import logger from './logger';
import { PERFORMANCE } from './constants';

/**
 * Web Vitals Analytics
 * Tracks Core Web Vitals and sends them to analytics endpoint
 */

interface AnalyticsPayload {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Get rating for a metric based on thresholds
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      if (value <= PERFORMANCE.LCP_GOOD) return 'good';
      if (value <= PERFORMANCE.LCP_NEEDS_IMPROVEMENT) return 'needs-improvement';
      return 'poor';

    case 'FID':
      if (value <= PERFORMANCE.FID_GOOD) return 'good';
      if (value <= PERFORMANCE.FID_NEEDS_IMPROVEMENT) return 'needs-improvement';
      return 'poor';

    case 'CLS':
      if (value <= PERFORMANCE.CLS_GOOD) return 'good';
      if (value <= PERFORMANCE.CLS_NEEDS_IMPROVEMENT) return 'needs-improvement';
      return 'poor';

    case 'TTFB':
      if (value <= PERFORMANCE.TTFB_GOOD) return 'good';
      if (value <= PERFORMANCE.TTFB_NEEDS_IMPROVEMENT) return 'needs-improvement';
      return 'poor';

    default:
      return 'good';
  }
}

/**
 * Send metric to analytics endpoint
 */
function sendToAnalytics(metric: Metric) {
  const body: AnalyticsPayload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: body.rating,
    });
  }

  // Send to Sentry Performance Monitoring
  // Note: metrics API might not be available in all SDK versions
  try {
    if ('metrics' in Sentry && typeof Sentry.metrics === 'object' && Sentry.metrics !== null) {
      const metricsObj = Sentry.metrics as {
        distribution?: (name: string, value: number, options?: Record<string, unknown>) => void;
      };
      if (typeof metricsObj.distribution === 'function') {
        metricsObj.distribution(metric.name, metric.value, {
          unit: 'millisecond',
          tags: {
            rating: body.rating,
            navigationType: metric.navigationType,
          },
        });
      }
    }
  } catch (error) {
    // Silently fail if metrics API not available
    logger.warn('Sentry metrics API not available:', error);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Use sendBeacon for reliability (works even when page is being unloaded)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(error => {
        logger.error('Failed to send analytics:', error);
      });
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once when the app loads
 */
export function initWebVitals() {
  try {
    // Core Web Vitals (web-vitals v5 API)
    onCLS(sendToAnalytics); // Cumulative Layout Shift
    onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID in v5)
    onLCP(sendToAnalytics); // Largest Contentful Paint

    // Other important metrics
    onFCP(sendToAnalytics); // First Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte

    if (process.env.NODE_ENV === 'development') {
      logger.info('[Web Vitals] Monitoring initialized');
    }
  } catch (error) {
    logger.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[Analytics] Event: ${eventName}`, properties);
  }

  if (process.env.NODE_ENV === 'production') {
    const body = {
      event: eventName,
      properties: properties || {},
      timestamp: Date.now(),
      url: window.location.href,
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/events', blob);
    } else {
      fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(error => {
        logger.error('Failed to track event:', error);
      });
    }
  }
}

/**
 * Track page view
 */
export function trackPageView(page: string) {
  trackEvent('page_view', {
    page,
    referrer: document.referrer || 'direct',
  });
}

/**
 * Track custom metric
 */
export function trackCustomMetric(name: string, value: number) {
  // Create a metric-like object (not using strict Metric type for custom metrics)
  const metric = {
    name,
    value,
    rating: 'good' as const,
    delta: value,
    id: `${name}-${Date.now()}`,
    navigationType: 'navigate',
  };

  sendToAnalytics(metric as Metric);
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    logger.error('[Analytics] Error:', error, context);
  }

  if (process.env.NODE_ENV === 'production') {
    const body = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: context || {},
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    fetch('/api/analytics/errors', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(err => {
      logger.error('Failed to track error:', err);
    });
  }
}

/**
 * Track user interaction
 */
export function trackInteraction(element: string, action: string, label?: string, value?: number) {
  trackEvent('user_interaction', {
    element,
    action,
    ...(label && { label }),
    ...(value !== undefined && { value }),
  });
}

/**
 * Track export action
 */
export function trackExport(format: 'pdf' | 'excel' | 'json', itemCount: number) {
  trackEvent('export', {
    format,
    item_count: itemCount,
  });
}

/**
 * Track map interaction
 */
export function trackMapInteraction(action: string, data?: Record<string, unknown>) {
  trackEvent('map_interaction', {
    action,
    ...data,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    query: query.substring(0, 100), // Limit query length for privacy
    results_count: resultsCount,
  });
}

/**
 * Track filter change
 */
export function trackFilterChange(filterType: string, value: boolean) {
  trackEvent('filter_change', {
    filter_type: filterType,
    value,
  });
}

/**
 * Track language change
 */
export function trackLanguageChange(from: string, to: string) {
  trackEvent('language_change', {
    from,
    to,
  });
}

/**
 * Track timeline interaction
 */
export function trackTimelineInteraction(action: string, date?: string) {
  trackEvent('timeline_interaction', {
    action,
    ...(date && { date }),
  });
}

/**
 * Get performance metrics summary
 */
export function getPerformanceSummary() {
  if (!window?.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation timing
    dns: navigation ? Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) : 0,
    tcp: navigation ? Math.round(navigation.connectEnd - navigation.connectStart) : 0,
    ttfb: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : 0,
    download: navigation ? Math.round(navigation.responseEnd - navigation.responseStart) : 0,
    domInteractive: navigation ? Math.round(navigation.domInteractive - navigation.fetchStart) : 0,
    domComplete: navigation ? Math.round(navigation.domComplete - navigation.fetchStart) : 0,
    loadComplete: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,

    // Paint timing
    fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    lcp: 0, // Will be updated by getLCP

    // Resource timing
    resourceCount: performance.getEntriesByType('resource').length,
    resourceSize: performance
      .getEntriesByType('resource')
      .reduce((sum, r: any) => sum + (r.transferSize || 0), 0),
  };
}

export default {
  initWebVitals,
  trackEvent,
  trackPageView,
  trackCustomMetric,
  trackError,
  trackInteraction,
  trackExport,
  trackMapInteraction,
  trackSearch,
  trackFilterChange,
  trackLanguageChange,
  trackTimelineInteraction,
  getPerformanceSummary,
};
