/**
 * Analytics service for tracking user interactions, performance metrics,
 * and application events.
 */
import { AnalyticsEvent, AnalyticsMetric, EventCategory, EventAction } from '@/types/analytics';
import { batch } from '@/utils/batch';

class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = true;
  private queue: AnalyticsEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeService();
  }

  /**
   * Initialize the analytics service and start queue processing
   */
  private initializeService(): void {
    // Start queue processor
    this.startQueueProcessor();

    // Add page visibility listener
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue(true); // Force flush when page is hidden
      }
    });

    // Initialize user data if available
    this.initializeUserData();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.getInstance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track a user interaction or application event
   */
  public trackEvent(category: EventCategory, action: EventAction, label?: string, value?: number): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language
      }
    };

    this.queueEvent(event);
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metric: AnalyticsMetric): void {
    if (!this.isEnabled) return;

    this.queueEvent({
      category: 'Performance',
      action: 'metric',
      label: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: {
        ...metric.metadata,
        category: metric.category
      }
    });
  }

  /**
   * Track error events
   */
  public trackError(error: {
    name: string;
    message: string;
    context?: string;
    metadata?: any;
  }): void {
    if (!this.isEnabled) return;

    this.queueEvent({
      category: 'Error',
      action: 'error',
      label: error.name,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: {
        message: error.message,
        context: error.context,
        ...error.metadata,
        url: window.location.href
      }
    });
  }

  /**
   * Track map interactions specifically
   */
  public trackMapInteraction(action: string, metadata?: Record<string, any>): void {
    this.trackEvent('Map', action as EventAction, undefined, undefined, {
      ...metadata,
      zoomLevel: window.map?.getZoom(),
      center: window.map?.getCenter()
    });
  }

  /**
   * Add event to queue
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.queue.push(event);

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueue();
    }
  }

  /**
   * Process and send queued events
   */
  private async flushQueue(force: boolean = false): Promise<void> {
    if (!this.queue.length) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      if (force) {
        // If forcing flush (e.g., page unload), use beacon API as fallback
        const success = navigator.sendBeacon('/api/analytics/events', JSON.stringify(events));
        if (!success) {
          this.queue = [...this.queue, ...events];
        }
      } else {
        console.error('Failed to send analytics events:', error);
        this.queue = [...this.queue, ...events];
      }
    }
  }

  /**
   * Send events to analytics endpoint
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    const batchedEvents = batch(events, 50); // Process in batches of 50 events

    for (const batch of batchedEvents) {
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events: batch })
        });

        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`);
        }
      } else {
        console.log('Analytics events:', batch);
      }
    }
  }

  /**
   * Start queue processor interval
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.flushQueue();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Initialize user data from localStorage or cookies
   */
  private initializeUserData(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = storedUserId;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public utility methods
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.queue = [];
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  public clearUserId(): void {
    this.userId = undefined;
    localStorage.removeItem('userId');
  }
}

export const analytics = AnalyticsService.getInstance();
export default analytics;