// File: app/utils/monitoring.ts
import * as Sentry from '@sentry/nextjs';

/**
 * Custom monitoring utilities for tracking app-specific metrics
 */

/**
 * Track accessibility issues
 */
export function trackAccessibilityIssue(issue: {
  type: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  element: string;
  description: string;
  wcagCriteria?: string;
}) {
  Sentry.captureMessage(`Accessibility Issue: ${issue.type}`, {
    level: issue.severity === 'critical' || issue.severity === 'serious' ? 'error' : 'warning',
    tags: {
      type: 'accessibility',
      severity: issue.severity,
      wcagCriteria: issue.wcagCriteria ?? 'unknown',
    },
    extra: {
      element: issue.element,
      description: issue.description,
    },
  });
}

/**
 * Track user engagement events
 */
export function trackUserEngagement(event: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.info('[Engagement]', event);
  }

  // Send to Sentry as breadcrumb
  Sentry.addBreadcrumb({
    category: event.category,
    message: event.action,
    level: 'info',
    data: {
      label: event.label,
      value: event.value,
    },
  });
}

/**
 * Track hospital interactions
 */
export function trackHospitalInteraction(
  hospitalId: string,
  action: 'view' | 'favorite' | 'share' | 'navigate'
) {
  trackUserEngagement({
    action,
    category: 'hospital',
    label: hospitalId,
  });
}

/**
 * Track map interactions
 */
export function trackMapInteraction(action: 'zoom' | 'pan' | 'marker-click' | 'filter' | 'search') {
  trackUserEngagement({
    action,
    category: 'map',
  });
}

/**
 * Track export feature usage
 */
export function trackExport(format: 'pdf' | 'csv' | 'excel' | 'json') {
  trackUserEngagement({
    action: 'export',
    category: 'export',
    label: format,
  });
}

/**
 * Track performance issues
 */
export function trackPerformanceIssue(issue: {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
}) {
  Sentry.captureMessage(`Performance Issue: ${issue.metric}`, {
    level: issue.severity,
    tags: {
      type: 'performance',
      metric: issue.metric,
    },
    extra: {
      value: issue.value,
      threshold: issue.threshold,
      exceededBy: issue.value - issue.threshold,
    },
  });
}

/**
 * Track API errors
 */
export function trackApiError(error: {
  endpoint: string;
  method: string;
  statusCode?: number;
  message: string;
}) {
  Sentry.captureException(new Error(`API Error: ${error.endpoint}`), {
    tags: {
      type: 'api-error',
      endpoint: error.endpoint,
      method: error.method,
      statusCode: error.statusCode?.toString() ?? 'unknown',
    },
    extra: {
      message: error.message,
    },
  });
}

/**
 * Initialize monitoring
 */
export function initMonitoring() {
  // Set user context (anonymous by default)
  Sentry.setUser({
    id: 'anonymous',
  });

  // Track when user becomes active
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      Sentry.addBreadcrumb({
        category: 'app',
        message: 'Application loaded',
        level: 'info',
      });
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      Sentry.addBreadcrumb({
        category: 'app',
        message: document.hidden ? 'Application hidden' : 'Application visible',
        level: 'info',
      });
    });
  }
}

/**
 * Custom error boundary integration
 */
export function reportErrorBoundary(error: Error, errorInfo: { componentStack?: string | null }) {
  Sentry.captureException(error, {
    tags: {
      type: 'react-error-boundary',
    },
    extra: {
      componentStack: errorInfo.componentStack ?? undefined,
    },
  });
}
