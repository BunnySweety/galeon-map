import { analytics } from './analyticsService';
import { PerformanceMetric, PerformanceMarks, PerformanceCategory } from '@/types/performance';

/**
 * Service for tracking and analyzing performance metrics across the application.
 * Handles performance measurements, tracking, and reporting.
 */
class PerformanceService {
  private static instance: PerformanceService;
  private marks: PerformanceMarks = new Map();
  private metricsHistory: PerformanceMetric[] = [];
  private readonly METRICS_HISTORY_LENGTH = 100;
  private observer: PerformanceObserver | null = null;

  // Performance thresholds in milliseconds
  private readonly THRESHOLDS = {
    RENDER: 16.67,      // Target for 60fps
    INTERACTION: 100,   // Maximum time for user interaction response
    MAP_OPERATION: 200, // Maximum time for map operations
    PAGE_LOAD: 3000,    // Target page load time
    API_CALL: 1000      // Maximum time for API calls
  } as const;

  private constructor() {
    this.initializeObserver();
  }

  /**
   * Singleton pattern implementation
   */
  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Initialize the Performance Observer to track various performance metrics
   */
  private initializeObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          switch (entry.entryType) {
            case 'measure':
              this.handleMeasure(entry);
              break;
            case 'longtask':
              this.handleLongTask(entry);
              break;
            case 'layout-shift':
              this.handleLayoutShift(entry);
              break;
            case 'largest-contentful-paint':
              this.handleLCP(entry);
              break;
            case 'first-input':
              this.handleFID(entry);
              break;
          }
        });
      });

      this.observer.observe({ 
        entryTypes: [
          'measure', 
          'longtask', 
          'layout-shift', 
          'largest-contentful-paint',
          'first-input'
        ] 
      });

    } catch (error) {
      console.error('Failed to initialize PerformanceObserver:', error);
    }
  }

  /**
   * Start measuring a performance metric
   * @param name - The name of the metric to measure
   * @param category - The category of the metric
   */
  public startMeasure(name: string, category: PerformanceCategory = 'Custom'): void {
    const startTime = performance.now();
    
    this.marks.set(name, {
      startTime,
      measurements: [],
      category
    });

    // Use Performance API if available
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }

    // Log start for long operations
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️ ${name}`);
    }
  }

  /**
   * End measuring a performance metric and record results
   * @param name - The name of the metric to end measuring
   * @returns The duration of the measurement in milliseconds
   */
  public endMeasure(name: string): number {
    const endTime = performance.now();
    const mark = this.marks.get(name);

    if (!mark) {
      console.warn(`No measurement found for: ${name}`);
      return 0;
    }

    const duration = endTime - mark.startTime;

    // Record the measurement
    mark.measurements.push(duration);

    // Keep only recent measurements
    if (mark.measurements.length > this.METRICS_HISTORY_LENGTH) {
      mark.measurements.shift();
    }

    // Use Performance API if available
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Record metric
    this.recordMetric({
      name,
      value: duration,
      category: mark.category,
      timestamp: Date.now()
    });

    // Check against thresholds
    this.checkThreshold(name, duration, mark.category);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`⏱️ ${name}`);
    }

    return duration;
  }

  /**
   * Measure an async operation
   * @param name - Operation name
   * @param operation - Async function to measure
   * @returns The result of the async operation
   */
  public async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    category: PerformanceCategory = 'Async'
  ): Promise<T> {
    this.startMeasure(name, category);
    
    try {
      const result = await operation();
      const duration = this.endMeasure(name);
      
      analytics.trackPerformance({
        name,
        value: duration,
        category
      });
      
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Check if a metric exceeds its threshold
   */
  private checkThreshold(name: string, duration: number, category: PerformanceCategory): void {
    let threshold: number | undefined;

    switch (category) {
      case 'Render':
        threshold = this.THRESHOLDS.RENDER;
        break;
      case 'Interaction':
        threshold = this.THRESHOLDS.INTERACTION;
        break;
      case 'Map':
        threshold = this.THRESHOLDS.MAP_OPERATION;
        break;
      case 'API':
        threshold = this.THRESHOLDS.API_CALL;
        break;
    }

    if (threshold && duration > threshold) {
      console.warn(`Performance threshold exceeded: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
      
      analytics.trackPerformance({
        name: `${name}_threshold_exceeded`,
        value: duration,
        category,
        metadata: { threshold }
      });
    }
  }

  /**
   * Handle different types of performance entries
   */
  private handleMeasure(entry: PerformanceEntry): void {
    this.recordMetric({
      name: entry.name,
      value: entry.duration,
      category: 'Measure',
      timestamp: Date.now()
    });
  }

  private handleLongTask(entry: PerformanceEntry): void {
    analytics.trackPerformance({
      name: 'long_task',
      value: entry.duration,
      category: 'Performance',
      metadata: { entryType: entry.entryType }
    });
  }

  private handleLayoutShift(entry: any): void {
    if (entry.hadRecentInput) return;

    analytics.trackPerformance({
      name: 'cumulative_layout_shift',
      value: entry.value,
      category: 'Web Vitals'
    });
  }

  private handleLCP(entry: any): void {
    analytics.trackPerformance({
      name: 'largest_contentful_paint',
      value: entry.startTime,
      category: 'Web Vitals'
    });
  }

  private handleFID(entry: any): void {
    analytics.trackPerformance({
      name: 'first_input_delay',
      value: entry.processingStart - entry.startTime,
      category: 'Web Vitals'
    });
  }

  /**
   * Utility methods for specific performance measurements
   */
  public measureMapOperation(name: string, operation: () => void): void {
    this.startMeasure(name, 'Map');
    operation();
    this.endMeasure(name);
  }

  public measureRenderTime(componentName: string): () => void {
    const metricName = `render_${componentName}`;
    this.startMeasure(metricName, 'Render');
    
    return () => {
      const duration = this.endMeasure(metricName);
      if (duration > this.THRESHOLDS.RENDER) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get performance data
   */
  public getMetricsHistory(): PerformanceMetric[] {
    return [...this.metricsHistory];
  }

  public getAverageDuration(name: string): number {
    const mark = this.marks.get(name);
    if (!mark?.measurements.length) return 0;

    const sum = mark.measurements.reduce((acc, val) => acc + val, 0);
    return sum / mark.measurements.length;
  }

  /**
   * Clear performance data
   */
  public clearMetrics(): void {
    this.marks.clear();
    this.metricsHistory = [];
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}

export const performanceService = PerformanceService.getInstance();
export default performanceService;